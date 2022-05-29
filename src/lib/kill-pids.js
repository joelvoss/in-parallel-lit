import os from 'os';
import crossSpawn from 'cross-spawn';

////////////////////////////////////////////////////////////////////////////////

/**
 * Wrap crossSpawn in a Promise.
 * @param {string} cmd
 * @param {Array<string|number>} args
 * @param {any} options
 */
function crossSpawnPromise(cmd, args, options) {
	return new Promise((resolve, reject) => {
		let stdout = '';
		let stderr = '';
		const ch = crossSpawn(cmd, args, options);

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
 * @param {number} pid
 */
export async function killPids(pid, platform = process.platform) {
	if (platform === 'win32') {
		crossSpawn('taskkill', ['/F', '/T', '/PID', pid]);
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
		stdout = stdout.split(os.EOL);

		let pidExists = false;
		const pidTree = {};
		for (let i = 1; i < stdout.length; i++) {
			stdout[i] = stdout[i].trim();
			if (!stdout[i]) continue;

			stdout[i] = stdout[i].split(/\s+/);
			stdout[i][0] = parseInt(stdout[i][0], 10); // PPID
			stdout[i][1] = parseInt(stdout[i][1], 10); // PID

			// NOTE(joel): Make sure our pid is part of the `ps` output.
			if (
				(!pidExists && stdout[i][1] === pid) ||
				(!pidExists && stdout[i][0] === pid)
			) {
				pidExists = true;
			}

			// NOTE(joel): Build the adiacency Hash Map (pid -> [children of pid])
			if (pidTree[stdout[i][0]]) {
				pidTree[stdout[i][0]].push(stdout[i][1]);
			} else {
				pidTree[stdout[i][0]] = [stdout[i][1]];
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
