import { getStreamKind } from '../../src/lib/get-stream-kind';
import { Writable } from 'node:stream';

describe(`getStreamKind`, () => {
	test('fallback', () => {
		expect(getStreamKind()).toBe('ignore')
	});

	test('mismatch', () => {
		const stream = new Writable();
		expect(getStreamKind(stream)).toBe('pipe')
	});
	
	test('match', () => {
		const proc = process.stdin;
		proc.isTTY = true;
		expect(getStreamKind(proc, proc)).toBe(proc)
	});
	
	test('default', () => {
		const stream = new Writable();
		expect(getStreamKind(stream, process.stdin)).toBe('pipe')
	});
});
