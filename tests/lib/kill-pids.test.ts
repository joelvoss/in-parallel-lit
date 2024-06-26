import { describe, test, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';

import { killPids } from '../../src/lib/kill-pids';

////////////////////////////////////////////////////////////////////////////////

const crossSpawnMock = vi.hoisted(() => {
	return { spawn: vi.fn() };
});

vi.mock('cross-spawn', () => {
	return { spawn: crossSpawnMock.spawn };
});

////////////////////////////////////////////////////////////////////////////////

describe(`killPids`, () => {
	test('default (*nix)', async () => {
		let toBeKilledPids: number[] = [];

		const killSpy = vi.spyOn(process, 'kill');
		killSpy.mockImplementation(pid => {
			toBeKilledPids.push(pid);
			return true;
		});

		crossSpawnMock.spawn.mockImplementation(() => {
			const mockChildProcess = new EventEmitter();
			// @ts-expect-error - Mocking `stdout` and `stderr` properties
			mockChildProcess.stdout = new Readable({
				read() {
					this.push(
						'PPID   PID\n' +
							'   1   430\n' +
							' 430   432\n' +
							'   1   727\n' +
							'   1  7166\n',
					);
					// NOTE(joel): `null` signals that there's nothing left to read from
					// the stream
					this.push(null);
				},
			});

			// @ts-expect-error - Mocking `stdout` and `stderr` properties
			mockChildProcess.stdout.once('end', () => {
				mockChildProcess.emit('close', 0);
			});

			// @ts-expect-error - Mocking `stdout` and `stderr` properties
			mockChildProcess.stderr = new Readable({
				read() {
					this.push(null);
				},
			});

			return mockChildProcess;
		});

		await killPids(430, 'darwin');

		expect(toBeKilledPids).toEqual([430, 432]);
	});

	test('default (win)', async () => {
		let args: unknown[] = [];

		crossSpawnMock.spawn.mockImplementation((..._args) => {
			args = _args;
		});

		await killPids(430, 'win32');

		expect(args).toEqual(['taskkill', ['/F', '/T', '/PID', '430']]);
	});
});
