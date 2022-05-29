import crossSpawn from 'cross-spawn';
import { killPids } from './kill-pids.js';

/**
 * Launches a new process with the given command.
 * This is almost same as `child_process.spawn`, but it adds a `kill` method
 * that kills the instance process and its sub processes.
 * @param {string} command
 * @param {string[]} args
 * @param {object} options
 * @returns {ChildProcess}
 */
export function spawn(command, args, options) {
	const child = crossSpawn(command, args, options);
	child.kill = function kill() {
		killPids(this.pid);
	};

	return child;
}
