import { spawn as cSpawn } from 'cross-spawn';
import { killPids } from './kill-pids';
import type { SpawnOptions } from 'child_process';

/**
 * Launches a new process with the given command.
 * This is almost same as `child_process.spawn`, but it adds a `kill` method
 * that kills the instance process and its sub processes.
 */
export function spawn(command: string, args: string[], options: SpawnOptions) {
	const child = cSpawn(command, args, options);
	child.kill = function kill() {
		killPids(this.pid as number);
		return true;
	};

	return child;
}
