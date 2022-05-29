import { InParallelError } from './lib/in-parallel-error.js';
import { spawn } from './lib/spawn.js';
import { MemoryWritable } from './lib/memory-writable.js';
import { getSignalNumber } from './lib/get-signal-num.js';
import { removeFromArr } from './lib/remove-from-arr.js';
import { wrapStreamWithLabel } from './lib/wrap-stream-with-label.js';
import { getStreamKind } from './lib/get-stream-kind.js';

/**
 * prog represents the main program logic.
 * @param {{[key: string]: any, _: string[]}} opts
 * @param {NodeJS.process} proc
 * @returns {Promise<void>}
 */
export function prog(opts, proc) {
	const { _: tasks, ...options } = opts;

	return new Promise((resolve, reject) => {
		let results = [];
		let queue = [];
		let promises = [];
		let error = null;
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

			const originalOutputStream = proc.stdout;
			const optionsClone = {
				...Object.assign({}, options),
				stdout: proc.stdout,
				stderr: proc.stderr,
				stdin: proc.stdin,
			};
			const writer = new MemoryWritable();

			if (options['aggregate-output']) {
				optionsClone.stdout = writer;
			}

			const task = queue.shift();
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

/**
 * @typedef {Object} RunTaskOptions
 * @prop {stream.Readable} stdin
 * @prop {stream.Writable} stdout
 * @prop {stream.Writable} stderr
 */

/**
 * runTask executes a single task as a child process.
 * @param {string} name
 * @param {RunTaskOptions} opts
 * @returns {Promise<{name: string, code: number, signal: string}>}
 */
function runTask(name, opts) {
	let proc = null;

	const task = new Promise((resolve, reject) => {
		const stdin = opts.stdin;
		const stdout = wrapStreamWithLabel(opts.stdout, name);
		const stderr = wrapStreamWithLabel(opts.stderr, name);

		const stdinKind = getStreamKind(stdin, process.stdin);
		const stdoutKind = getStreamKind(stdout, process.stdout);
		const stderrKind = getStreamKind(stderr, process.stderr);

		const [spawnName, ...spawnArgs] = name.split(' ');

		proc = spawn(spawnName, spawnArgs, {
			stdio: [stdinKind, stdoutKind, stderrKind],
		});

		// Piping stdio.
		if (stdinKind === 'pipe') {
			stdin.pipe(proc.stdin);
		}
		if (stdoutKind === 'pipe') {
			proc.stdout.pipe(stdout, { end: false });
		}
		if (stderrKind === 'pipe') {
			proc.stderr.pipe(stderr, { end: false });
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

	task.abort = () => {
		if (proc == null) return;
		proc.kill();
		proc = null;
	};

	return task;
}
