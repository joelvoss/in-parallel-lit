import { InParallelError } from '../../src/lib/in-parallel-error';

describe(`InParallelError`, () => {
	test('default', () => {
		const causeResult = { name: 'test', code: 1 };
		const allResults = [
			{ name: 'test-1', code: 1 },
			{ name: 'test-2', code: 2 },
		];
		const err = new InParallelError(causeResult, allResults);
		expect(err instanceof InParallelError).toBe(true);
		expect(err.name).toBe('test');
		expect(err.code).toBe(1);
		expect(err.results).toBe(allResults);
	});
});
