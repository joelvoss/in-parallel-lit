import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { wrapStreamWithLabel } from '../../src/lib/wrap-stream-with-label';

describe(`wrapStreamWithLabel`, () => {
	beforeEach(() => {
		vi.stubEnv('FORCE_COLOR', '1');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test('default', () =>
		new Promise((done, rej) => {
			expect.assertions(1);

			const wrapper = 'wrapper';
			const message = 'my test message';

			const stream = new PassThrough();
			const target = wrapStreamWithLabel(stream, wrapper);
			if (target == null) return rej();

			let chunks: unknown[] = [];
			target.on('data', chunk => chunks.push(chunk));
			target.on('end', () => {
				expect(chunks).toMatchInlineSnapshot(`
			[
			  {
			    "data": [
			      91,
			      119,
			      114,
			      97,
			      112,
			      112,
			      101,
			      114,
			      93,
			      32,
			      109,
			      121,
			      32,
			      116,
			      101,
			      115,
			      116,
			      32,
			      109,
			      101,
			      115,
			      115,
			      97,
			      103,
			      101,
			    ],
			    "type": "Buffer",
			  },
			]
		`);
				done(0);
			});

			target.end(message);
		}));

	test('TTY enabled', () =>
		new Promise((done, rej) => {
			expect.assertions(1);

			const wrapper = 'wrapper';
			const message = 'my test message';

			const stream = new PassThrough();
			// @ts-expect-error - TTY
			stream.isTTY = true;

			const target = wrapStreamWithLabel(stream, wrapper);
			if (target == null) return rej();

			let chunks: unknown[] = [];
			target.on('data', chunk => chunks.push(chunk));
			target.on('end', () => {
				expect(chunks).toMatchInlineSnapshot(`
			[
			  {
			    "data": [
			      27,
			      91,
			      51,
			      54,
			      109,
			      91,
			      119,
			      114,
			      97,
			      112,
			      112,
			      101,
			      114,
			      93,
			      32,
			      27,
			      91,
			      51,
			      57,
			      109,
			      109,
			      121,
			      32,
			      116,
			      101,
			      115,
			      116,
			      32,
			      109,
			      101,
			      115,
			      115,
			      97,
			      103,
			      101,
			    ],
			    "type": "Buffer",
			  },
			]
		`);
				done(0);
			});

			target.end(message);
		}));
});
