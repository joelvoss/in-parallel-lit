import { prog } from '../src/index';
import path from 'node:path';

////////////////////////////////////////////////////////////////////////////////

function getMockCalls(calls) {
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

	test('default', async () => {
		const processSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
		const cmdPath = path.resolve(__dirname, '../tests/__fixture__/mock-cmd.js');

		const cmd1Times = 5;
		const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
		const cmd2Times = 2;
		const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2`;

		const opts = { _: [cmd1, cmd2] };
		const res = await prog(opts, process);

		expect(res).toEqual([
			{ code: 0, name: `node ${cmdPath} repeat-5 cmd1` },
			{ code: 0, name: `node ${cmdPath} repeat-2 cmd2` },
		]);

		expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);
		const stdout = getMockCalls(processSpy.mock.calls);
		expect(stdout).toEqual([
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 0 times\n`,
			`[node ${cmdPath} repeat-2 cmd2] cmd2 - repeat 0 times\n`,
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 1 times\n`,
			`[node ${cmdPath} repeat-2 cmd2] cmd2 - repeat 1 times\n`,
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 2 times\n`,
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 3 times\n`,
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 4 times\n`,
		]);

		processSpy.mockRestore();
	});

	test('abort if one process errors out', async () => {
		const processSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
		const cmdPath = path.resolve(__dirname, '../tests/__fixture__/mock-cmd.js');

		const cmd1Times = 5;
		const cmd1 = `node ${cmdPath} repeat-${cmd1Times} cmd1`;
		const cmd2Times = 2;
		const cmd2 = `node ${cmdPath} error-${cmd2Times} cmd2`;

		const opts = { _: [cmd1, cmd2] };
		try {
			await prog(opts, process);
		} catch (err) {
			expect(err.message).toBe(`"node ${cmdPath} error-2 cmd2" exited with 1.`);
		}

		expect(processSpy).toHaveBeenCalledTimes(cmd2Times * 2);
		const stdout = getMockCalls(processSpy.mock.calls);
		expect(stdout).toEqual([
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 0 times\n`,
			`[node ${cmdPath} error-2 cmd2] cmd2 - repeat 0 times\n`,
			`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 1 times\n`,
			`[node ${cmdPath} error-2 cmd2] cmd2 - error\n`,
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
			const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2`;

			const opts = { _: [cmd1, cmd2], 'aggregate-output': true };
			const res = await prog(opts, process);

			expect(res).toEqual([
				{ code: 0, name: `node ${cmdPath} repeat-2 cmd1` },
				{ code: 0, name: `node ${cmdPath} repeat-2 cmd2` },
			]);

			// NOTE(joel): One stdout for each command.
			expect(processSpy).toHaveBeenCalledTimes(2);
			const stdout = getMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[node ${cmdPath} repeat-2 cmd1] cmd1 - repeat 0 times\n` +
					`[node ${cmdPath} repeat-2 cmd1] cmd1 - repeat 1 times\n`,
				`[node ${cmdPath} repeat-2 cmd2] cmd2 - repeat 0 times\n` +
					`[node ${cmdPath} repeat-2 cmd2] cmd2 - repeat 1 times\n`,
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
			const cmd2 = `node ${cmdPath} repeat-${cmd2Times} cmd2`;

			const opts = { _: [cmd1, cmd2], 'max-parallel': 1 };
			const res = await prog(opts, process);

			expect(res).toEqual([
				{ code: 0, name: `node ${cmdPath} repeat-2 cmd1` },
				{ code: 0, name: `node ${cmdPath} repeat-2 cmd2` },
			]);

			// NOTE(joel): Output as "default" but the sorting is different.
			expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);

			const stdout = getMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[node ${cmdPath} repeat-2 cmd1] cmd1 - repeat 0 times\n`,
				`[node ${cmdPath} repeat-2 cmd1] cmd1 - repeat 1 times\n`,
				`[node ${cmdPath} repeat-2 cmd2] cmd2 - repeat 0 times\n`,
				`[node ${cmdPath} repeat-2 cmd2] cmd2 - repeat 1 times\n`,
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
			const cmd2 = `node ${cmdPath} error-${cmd2Times} cmd2`;

			const opts = { _: [cmd1, cmd2], 'continue-on-error': true };

			try {
				await prog(opts, process);
			} catch (err) {
				expect(err.message).toBe(
					`"node ${cmdPath} error-2 cmd2" exited with 1.`,
				);
			}

			expect(processSpy).toHaveBeenCalledTimes(cmd1Times + cmd2Times);
			const stdout = getMockCalls(processSpy.mock.calls);
			expect(stdout).toEqual([
				`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 0 times\n`,
				`[node ${cmdPath} error-2 cmd2] cmd2 - repeat 0 times\n`,
				`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 1 times\n`,
				`[node ${cmdPath} error-2 cmd2] cmd2 - error\n`,
				`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 2 times\n`,
				`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 3 times\n`,
				`[node ${cmdPath} repeat-5 cmd1] cmd1 - repeat 4 times\n`,
			]);

			processSpy.mockRestore();
		});
	});
});
