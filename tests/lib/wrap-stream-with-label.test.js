import { wrapStreamWithLabel } from '../../src/lib/wrap-stream-with-label';
import { PassThrough } from 'node:stream';

describe(`wrapStreamWithLabel`, () => {
	test('default', done => {
		expect.assertions(1);

		const wrapper = 'wrapper';
		const message = 'my test message';

		const stream = new PassThrough();
		const target = wrapStreamWithLabel(stream, wrapper);

		let chunks = [];
		target.on('data', chunk => chunks.push(chunk));
		target.on('end', () => {
			expect(chunks).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "data": Array [
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
			done();
		});

		target.end(message);
	});

	test('TTY enabled', done => {
		expect.assertions(1);

		const wrapper = 'wrapper';
		const message = 'my test message';

		const stream = new PassThrough();
		stream.isTTY = true;

		const target = wrapStreamWithLabel(stream, wrapper);

		let chunks = [];
		target.on('data', chunk => chunks.push(chunk));
		target.on('end', () => {
			expect(chunks).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "data": Array [
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
			done();
		});

		target.end(message);
	});
});
