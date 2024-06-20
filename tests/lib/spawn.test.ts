import { describe, test, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { spawn } from '../../src/lib/spawn';

////////////////////////////////////////////////////////////////////////////////

const crossSpawnMock = vi.hoisted(() => {
	return { spawn: vi.fn() };
});

vi.mock('cross-spawn', () => {
	return { spawn: crossSpawnMock.spawn };
});

////////////////////////////////////////////////////////////////////////////////

describe(`spawn`, () => {
	test('default', async () => {
		let args: unknown[] = [];

		crossSpawnMock.spawn.mockImplementation((..._args) => {
			args = _args;
			const mockChildProcess = new EventEmitter();
			// @ts-expect-error - mock
			mockChildProcess.stdout = new Readable();
			// @ts-expect-error - mock
			mockChildProcess.stderr = new Readable();
			return mockChildProcess;
		});

		const proc = spawn('ping', ['127.0.0.1'], {});
		expect(typeof proc.kill).toBe('function');
		expect(proc instanceof EventEmitter).toBe(true);
		expect(args).toEqual(['ping', ['127.0.0.1'], {}]);
	});
});
