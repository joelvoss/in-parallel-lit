import os from 'node:os';
import { spawn } from 'cross-spawn';
import type { SpawnOptions } from 'node:child_process';

////////////////////////////////////////////////////////////////////////////////

/**
 * Wrap crossSpawn in a Promise
 */
function crossSpawnPromise(
	cmd: string,
	args: readonly string[] = [],
	options: SpawnOptions = {},
): Promise<string> {
	return new Promise((resolve, reject) => {
		let stdout = '';
		let stderr = '';

		const ch = spawn(cmd, args, options);

		if (ch.stdout === null || ch.stderr === null) {
			return reject('stdout/stderr is null');
		}

		ch.stdout.on('data', d => {
			stdout += d.toString();
		});

		ch.stderr.on('data', d => {
			stderr += d.toString();
		});

		ch.on('error', err => reject(err));

		ch.on('close', code => {
			if (stderr) return reject(stderr);
			if (code !== 0) return reject(`${cmd} exited with code ${code}`);
			return resolve(stdout);
		});
	});
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Kills a process by ID and all its subprocesses.
 */
export async function killPids(pid: number, platform = process.platform) {
	if (platform === 'win32') {
		spawn('taskkill', ['/F', '/T', '/PID', String(pid)]);
		return;
	}

	try {
		// NOTE(joel): Example of stdout:
		//   PPID   PID
		//      1   430
		//    430   432
		//      1   727
		//      1  7166
		let stdout = await crossSpawnPromise('ps', ['-A', '-o', 'ppid,pid']);
		let stdoutRows = stdout.split(os.EOL);

		let pidExists = false;
		const pidTree: Record<number, number[]> = {};
		for (let i = 1; i < stdoutRows.length; i++) {
			stdoutRows[i] = stdoutRows[i].trim();
			if (!stdoutRows[i]) continue;

			let stdoutTuple = stdoutRows[i].split(/\s+/);
			let stdoutPpid = parseInt(stdoutTuple[0], 10);
			let stdoutPid = parseInt(stdoutTuple[1], 10);

			// NOTE(joel): Make sure our pid is part of the `ps` output.
			if (
				(!pidExists && stdoutPid === pid) ||
				(!pidExists && stdoutPpid === pid)
			) {
				pidExists = true;
			}

			// NOTE(joel): Build the adiacency Hash Map (pid -> [children of pid])
			if (pidTree[stdoutPpid]) {
				pidTree[stdoutPpid].push(stdoutPid);
			} else {
				pidTree[stdoutPpid] = [stdoutPid];
			}
		}

		// NOTE(joel): No matching pid found.
		if (!pidExists) return;

		// NOTE(joel): Starting by the `pid` provided, traverse the tree using
		// the adiacency Hash Map until the whole subtree is visited. Each pid
		// encountered while visiting is added to the pids array.
		let idx = 0;
		const pids = [pid];
		while (idx < pids.length) {
			let curpid = pids[idx++];
			if (!pidTree[curpid]) continue;

			for (let j = 0; j < pidTree[curpid].length; j++) {
				pids.push(pidTree[curpid][j]);
			}

			delete pidTree[curpid];
		}

		// NOTE(joel): Finally, kill all pids.
		for (const pid of pids) {
			process.kill(pid);
		}
	} catch (err) {
		/* Silence is golden */
	}
}
