import type { ChildProcess } from 'node:child_process';
import type { Readable, Writable } from 'node:stream';
import { getSignalNumber } from './lib/get-signal-num';
import { getStreamKind } from './lib/get-stream-kind';
import { InParallelError } from './lib/in-parallel-error';
import { MemoryWritable } from './lib/memory-writable';
import { removeFromArr } from './lib/remove-from-arr';
import { spawn } from './lib/spawn';
import { wrapStreamWithLabel } from './lib/wrap-stream-with-label';

interface Options {
	_: string[];
	// NOTE(joel): Keep in sync with options defined in `src/bin.ts`.
	names?: string;
	'aggregate-output'?: boolean;
	'continue-on-error'?: boolean;
	'max-parallel'?: number;
}

interface Result {
	name: string;
	code?: number | null;
}

interface QueueItem {
	name: string;
	index: number;
}

/**
 * prog represents the main program logic.
 */
export function prog(opts: Options, proc: NodeJS.Process) {
	const { _: tasks, ...options } = opts;

	const customTaskNames =
		options.names != null ? options.names.split(',').map(n => n.trim()) : [];

	return new Promise((resolve, reject) => {
		let results: Result[] = [];
		let queue: QueueItem[] = [];
		let promises: Task[] = [];
		let error: InParallelError | null = null;
		let aborted = false;

		// NOTE(joel): Resolve if no tasks are passed.
		if (tasks.length === 0) return done();

		// NOTE(joel): Pre-build result and queue arays.
		for (let i = 0; i < tasks.length; i++) {
			results.push({ name: tasks[i], code: undefined });
			queue.push({ name: tasks[i], index: i });
		}

		function done() {
			if (error == null) return resolve(results);
			return reject(error);
		}

		function abort() {
			if (aborted) return;

			aborted = true;
			if (promises.length === 0) return done();
			for (const p of promises) {
				p.abort();
			}
			return Promise.all(promises).then(done, reject);
		}

		function next() {
			if (aborted) return;

			// NOTE(joel): Return without resolving if the queue is empty.
			if (queue.length === 0) {
				if (promises.length === 0) return done();
				return;
			}

			const task = queue.shift();
			// NOTE(joel): This should never happen, but just in case.
			if (task == null) return;

			const originalOutputStream = proc.stdout;
			const optionsClone = {
				stdout: proc.stdout,
				stderr: proc.stderr,
				stdin: proc.stdin,
				customName: customTaskNames[task.index],
			};

			const writer = new MemoryWritable();

			if (options['aggregate-output']) {
				// NOTE(joel): Replace the stdout stream with a memory stream.
				// TypeScript doesn't like this, but it's fine.
				optionsClone.stdout = writer as unknown as NodeJS.WriteStream & {
					fd: 1;
				};
			}

			const promise = runTask(task.name, optionsClone);

			promises.push(promise);
			promise.then(
				result => {
					removeFromArr(promises, promise);

					if (aborted) return;

					if (options['aggregate-output']) {
						originalOutputStream.write(writer.toString());
					}

					// NOTE(joel): Check if the task failed as a result of a signal, and
					// amend the exit code as a result.
					if (result.code === null && result.signal !== null) {
						// NOTE(joel): An exit caused by a signal must return a status code
						// of 128 plus the value of the signal code.
						// @see https://nodejs.org/api/process.html#process_exit_codes
						result.code = 128 + getSignalNumber(result.signal);
					}

					// NOTE(joel): Save the result.
					results[task.index].code = result.code;

					// NOTE(joel): Aborts all tasks if it's an error.
					if (result.code) {
						error = new InParallelError(result, results);
						if (!options['continue-on-error']) {
							return abort();
						}
					}

					next();
				},
				err => {
					removeFromArr(promises, promise);
					if (!options['continue-on-error']) {
						error = err;
						return abort();
					}
					next();
				},
			);
		}

		let end = tasks.length;
		if (
			typeof options['max-parallel'] === 'number' &&
			options['max-parallel'] > 0
		) {
			end = Math.min(tasks.length, options['max-parallel']);
		}

		for (let i = 0; i < end; ++i) {
			next();
		}
	});
}

////////////////////////////////////////////////////////////////////////////////

interface RunTaskOptions {
	stdin: Readable;
	stdout: Writable;
	stderr: Writable;
	customName?: string;
}

interface TaskResult {
	name: string;
	code: number | null;
	signal: string | null;
}

interface Task extends Promise<TaskResult> {
	abort: () => void;
}

/**
 * runTask executes a single task as a child process.
 */
function runTask(name: string, opts: RunTaskOptions) {
	let proc: ChildProcess | null = null;

	const task = new Promise((resolve, reject) => {
		const stdin = opts.stdin;
		const stdout = wrapStreamWithLabel(opts.stdout, opts.customName || name);
		const stderr = wrapStreamWithLabel(opts.stderr, opts.customName || name);

		const stdinKind = getStreamKind(stdin, process.stdin);
		const stdoutKind = getStreamKind(stdout, process.stdout);
		const stderrKind = getStreamKind(stderr, process.stderr);

		const [spawnName, ...spawnArgs] = name.split(' ');

		proc = spawn(spawnName, spawnArgs, {
			stdio: [stdinKind, stdoutKind, stderrKind],
		});

		if (proc == null) return reject('Failed to spawn process');

		// Piping stdio.
		if (stdinKind === 'pipe') {
			stdin.pipe(proc.stdin!);
		}
		if (stdoutKind === 'pipe') {
			proc.stdout!.pipe(stdout!, { end: false });
		}
		if (stderrKind === 'pipe') {
			proc.stderr!.pipe(stderr!, { end: false });
		}

		// Register
		proc.on('error', err => {
			proc = null;
			return reject(err);
		});
		proc.on('close', (code, signal) => {
			proc = null;
			return resolve({ name, code, signal });
		});
	});

	// @ts-expect-error - `abort` is not part of the Promise interface.
	task.abort = () => {
		if (proc == null) return;
		proc.kill();
		proc = null;
	};

	return task as Task;
}
