import { prog } from '../src/index';
import path from 'node:path';

////////////////////////////////////////////////////////////////////////////////

/**
 * getMockCalls normalizes all `processSpy.mock.calls` and removes any
 * ANSI color codes, since we're not interested in those here.
 * See `select-color.test.js` as well as `wrap-stream-with-label.test.js` for
 * unit tests that should assert ANSI color codes.
 */
function getStdoutMockCalls(calls) {
	return calls.map(call => {
		const str = call[0].toString();
		return str.replace(
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			'',
		);
	});
}

////////////////////////////////////////////////////////////////////////////////

describe('prog', () => {
	jest.setTimeout(10000);

	beforeEach(() => {
		jest.restoreAllMocks();
		process.stdout.setMaxListeners(0);
		process.stderr.setMaxListeners(0);
		process.stdin.setMaxListeners(0);
	});

	test('default', async () => {
		const processSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
		const cmdPath = path.resolve(__dirname, '../tests/__fixture__/mock-cmd.js');

		const cmd1Times = 5;
		const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
		const cmd2Times = 2;
		const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2 delay`;

		const opts = { _: [cmd1, cmd2] };
		const res = await prog(opts, process);

		expect(res).toEqual([
			{ code: 0, name: cmd1 },
			{ code: 0, name: cmd2 },
		]);

		expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);
		const stdout = getStdoutMockCalls(processSpy.mock.calls);
		expect(stdout).toEqual([
			`[${cmd1}] cmd1 - repeat 0 times\n`,
			`[${cmd2}] cmd2 - repeat 0 times\n`,
			`[${cmd1}] cmd1 - repeat 1 times\n`,
			`[${cmd2}] cmd2 - repeat 1 times\n`,
			`[${cmd1}] cmd1 - repeat 2 times\n`,
			`[${cmd1}] cmd1 - repeat 3 times\n`,
			`[${cmd1}] cmd1 - repeat 4 times\n`,
		]);

		processSpy.mockRestore();
	});

	test('abort if one process errors out', async () => {
		const processSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
		const cmdPath = path.resolve(__dirname, '../tests/__fixture__/mock-cmd.js');

		const cmd1Times = 5;
		const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
		const cmd2Times = 2;
		const cmd2 = `node ${cmdPath} error-${cmd2Times} cmd2 delay`;

		try {
			const opts = { _: [cmd1, cmd2] };
			await prog(opts, process);
		} catch (err) {
			expect(err.message).toBe(`"${cmd2}" exited with 1.`);
		}

		expect(processSpy).toHaveBeenCalledTimes(cmd2Times * 2);
		const stdout = getStdoutMockCalls(processSpy.mock.calls);
		expect(stdout).toEqual([
			`[${cmd1}] cmd1 - repeat 0 times\n`,
			`[${cmd2}] cmd2 - repeat 0 times\n`,
			`[${cmd1}] cmd1 - repeat 1 times\n`,
			`[${cmd2}] cmd2 - error\n`,
		]);

		processSpy.mockRestore();
	});

	describe('options', () => {
		test('aggregate output', async () => {
			const processSpy = jest
				.spyOn(process.stdout, 'write')
				.mockImplementation();
			const cmdPath = path.resolve(
				__dirname,
				'../tests/__fixture__/mock-cmd.js',
			);

			const cmd1Times = 2;
			const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
			const cmd2Times = 2;
			const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2 delay`;

			const opts = { _: [cmd1, cmd2], 'aggregate-output': true };
			const res = await prog(opts, process);

			expect(res).toEqual([
				{ code: 0, name: cmd1 },
				{ code: 0, name: cmd2 },
			]);

			// NOTE(joel): One stdout for each command.
			expect(processSpy).toHaveBeenCalledTimes(2);
			const stdout = getStdoutMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[${cmd1}] cmd1 - repeat 0 times\n` +
					`[${cmd1}] cmd1 - repeat 1 times\n`,
				`[${cmd2}] cmd2 - repeat 0 times\n` +
					`[${cmd2}] cmd2 - repeat 1 times\n`,
			]);

			processSpy.mockRestore();
		});

		test('max-parallel', async () => {
			const processSpy = jest
				.spyOn(process.stdout, 'write')
				.mockImplementation();
			const cmdPath = path.resolve(
				__dirname,
				'../tests/__fixture__/mock-cmd.js',
			);

			const cmd1Times = 2;
			const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
			const cmd2Times = 2;
			const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2 delay`;

			const opts = { _: [cmd1, cmd2], 'max-parallel': 1 };
			const res = await prog(opts, process);

			expect(res).toEqual([
				{ code: 0, name: cmd1 },
				{ code: 0, name: cmd2 },
			]);

			// NOTE(joel): Output as "default" but the sorting is different.
			expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);

			const stdout = getStdoutMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[${cmd1}] cmd1 - repeat 0 times\n`,
				`[${cmd1}] cmd1 - repeat 1 times\n`,
				`[${cmd2}] cmd2 - repeat 0 times\n`,
				`[${cmd2}] cmd2 - repeat 1 times\n`,
			]);

			processSpy.mockRestore();
		});

		test('continue-on-error', async () => {
			const processSpy = jest
				.spyOn(process.stdout, 'write')
				.mockImplementation();
			const cmdPath = path.resolve(
				__dirname,
				'../tests/__fixture__/mock-cmd.js',
			);

			const cmd1Times = 5;
			const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
			const cmd2Times = 2;
			const cmd2 = `node ${cmdPath} error-${cmd2Times} cmd2 delay`;

			try {
				const opts = { _: [cmd1, cmd2], 'continue-on-error': true };
				await prog(opts, process);
			} catch (err) {
				expect(err.message).toBe(`"${cmd2}" exited with 1.`);
			}

			expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);
			const stdout = getStdoutMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[${cmd1}] cmd1 - repeat 0 times\n`,
				`[${cmd2}] cmd2 - repeat 0 times\n`,
				`[${cmd1}] cmd1 - repeat 1 times\n`,
				`[${cmd2}] cmd2 - error\n`,
				`[${cmd1}] cmd1 - repeat 2 times\n`,
				`[${cmd1}] cmd1 - repeat 3 times\n`,
				`[${cmd1}] cmd1 - repeat 4 times\n`,
			]);

			processSpy.mockRestore();
		});

		test('names', async () => {
			const processSpy = jest
				.spyOn(process.stdout, 'write')
				.mockImplementation();
			const cmdPath = path.resolve(
				__dirname,
				'../tests/__fixture__/mock-cmd.js',
			);

			const cmd1Times = 2;
			const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
			const cmd2Times = 2;
			const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2 delay`;

			const opts = { _: [cmd1, cmd2], names: 'first,second' };
			const res = await prog(opts, process);

			expect(res).toEqual([
				{ code: 0, name: cmd1 },
				{ code: 0, name: cmd2 },
			]);

			expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);
			const stdout = getStdoutMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[first] cmd1 - repeat 0 times\n`,
				`[second] cmd2 - repeat 0 times\n`,
				`[first] cmd1 - repeat 1 times\n`,
				`[second] cmd2 - repeat 1 times\n`,
			]);

			processSpy.mockRestore();
		});
	});
});
