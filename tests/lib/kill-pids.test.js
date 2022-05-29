import crossSpawn from 'cross-spawn';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';

import { killPids } from '../../src/lib/kill-pids';

////////////////////////////////////////////////////////////////////////////////

jest.mock('cross-spawn');

////////////////////////////////////////////////////////////////////////////////

describe(`killPids`, () => {
	test('default (*nix)', async () => {
		let toBeKilledPids = [];

		const killSpy = jest.spyOn(process, 'kill');
		killSpy.mockImplementation(pid => {
			toBeKilledPids.push(pid);
		});

		crossSpawn.mockImplementation(cmd => {
			const mockChildProcess = new EventEmitter();
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
			mockChildProcess.stdout.once('end', () => {
				mockChildProcess.emit('close', 0);
			});

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
		let args = [];
		crossSpawn.mockImplementation((..._args) => {
			args = _args;
		});

		await killPids(430, 'win32');

		expect(args).toEqual(['taskkill', ['/F', '/T', '/PID', 430]]);
	});
});
