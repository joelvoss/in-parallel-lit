import { describe, test, expect } from 'vitest';
import { PrefixTransform } from '../../src/lib/prefix-transform';
import { PassThrough } from 'node:stream';

describe(`PrefixTransform`, () => {
	test('default', () =>
		new Promise(done => {
			expect.assertions(1);

			const prefix = '[my test prefix] ';
			const message = 'my test message';

			const stream = new PassThrough();
			const target = new PrefixTransform(prefix);
			target.pipe(stream);

			let chunks: unknown[] = [];
			target.on('data', chunk => chunks.push(chunk));
			target.on('end', () => {
				expect(chunks.toString()).toBe(`${prefix}${message}`);
				done(0);
			});

			target.end(message);
		}));
});
