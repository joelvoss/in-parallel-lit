import { MemoryWritable } from '../../src/lib/memory-writable';

describe(`MemoryWritable`, () => {
	function writeToStream(stream, data, frequency = 0) {
		for (let i = 0; i <= data.length - 1; i++) {
			setTimeout(() => {
				const chunk = data[i];
				if (i === data.length - 1) {
					stream.end(chunk);
				} else {
					stream.write(chunk);
				}
			}, frequency);
		}
	}
	const testData = 'abcdefghijklmnopqrstuvwxyz';

	test('write data writable stream', done => {
		const memStream = new MemoryWritable();

		writeToStream(memStream, testData.split(''));

		memStream.on('finish', () => {
			expect(memStream.toString()).toBe(testData);
			done();
		});
	});

	test('toBuffer', done => {
		const memStream = new MemoryWritable();

		writeToStream(memStream, testData.split(''));

		memStream.on('finish', () => {
			expect(memStream.toBuffer().toJSON()).toEqual({
				data: [
					97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
					111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
				],
				type: 'Buffer',
			});
			done();
		});
	});

	test('toBuffer - all data in one buffer', done => {
		const memStream = new MemoryWritable();

		let arrTestData = [];
		let strTestData = '';
		for (let i = 0; i < 20; i++) {
			const b = Buffer.from([i]);
			arrTestData.push(b);
			strTestData += b.toString('hex');
		}

		writeToStream(memStream, arrTestData, 10);

		memStream.on('finish', () => {
			expect(memStream.toBuffer().toString('hex')).toBe(strTestData);
			done();
		});
	});
});
