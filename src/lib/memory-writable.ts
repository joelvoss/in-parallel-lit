import { Writable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

const noop = () => {};

export class MemoryWritable extends Writable {
	queue: Buffer[] = [];
	data: (Buffer | string | null)[];

	constructor(data: Buffer | string | null = null) {
		super();

		this.data = Array.isArray(data) ? data : [data];

		this.queue = [];
		for (let chunk of this.data) {
			if (chunk == null) continue;

			if (!(chunk instanceof Buffer)) {
				chunk = Buffer.from(chunk);
			}
			this.queue.push(chunk);
		}
	}

	_write(
		chunk: string | Buffer,
		enc: string | null,
		cb: (error?: Error | null) => void = noop,
	) {
		let decoder: StringDecoder | null = null;
		try {
			// @ts-expect-error - We catch any StringDecoder errors
			decoder = enc && enc !== 'buffer' ? new StringDecoder(enc) : null;
		} catch (err) {
			return cb(err as Error);
		}

		let decodedChunk = decoder != null ? decoder.write(chunk) : chunk;
		this.queue.push(
			Buffer.isBuffer(decodedChunk) ? decodedChunk : Buffer.from(decodedChunk),
		);
		cb();
	}

	_getQueueSize() {
		let size = 0;
		for (let i = 0; i < this.queue.length; i++) {
			size += this.queue[i].length;
		}
		return size;
	}

	toString() {
		let str = '';
		for (const chunk of this.queue) {
			str += chunk.toString();
		}
		return str;
	}

	toBuffer() {
		const buffer = Buffer.alloc(this._getQueueSize());
		let currentOffset = 0;
		for (const chunk of this.queue) {
			chunk.copy(buffer, currentOffset);
			currentOffset += chunk.length;
		}
		return buffer;
	}
}
