import crossSpawn from 'cross-spawn';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';

import { spawn } from '../../src/lib/spawn';

////////////////////////////////////////////////////////////////////////////////

jest.mock('cross-spawn');

////////////////////////////////////////////////////////////////////////////////

describe(`spawn`, () => {
	test('default', async () => {
		let args = [];
		crossSpawn.mockImplementation((..._args) => {
			args = _args;
			const mockChildProcess = new EventEmitter();
			mockChildProcess.stdout = new Readable();
			mockChildProcess.stderr = new Readable();
			return mockChildProcess;
		});

		const proc = spawn('ping', ['127.0.0.1'], {});
		expect(typeof proc.kill).toBe('function');
		expect(proc instanceof EventEmitter).toBe(true);
		expect(args).toEqual(['ping', ['127.0.0.1'], {}]);
	});
});
