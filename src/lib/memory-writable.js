import { Writable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

const noop = () => {};

/**
 * Writable stream that can hold written chunks.
 */
export class MemoryWritable extends Writable {
	queue = [];
	data = [];

	constructor(data = null) {
		super();

		// NOTE(joel): Ensure `data` is an array.
		this.data = Array.isArray(data) ? data : [data];

		this.queue = [];
		for (let chunk of this.data) {
			if (chunk == null) continue;

			// NOTE(joel): Ensure each chunk is a Buffer.
			if (!(chunk instanceof Buffer)) {
				chunk = Buffer.from(chunk);
			}
			this.queue.push(chunk);
		}
	}

	_write(chunk, enc, cb = noop) {
		let decoder = null;
		try {
			decoder = enc && enc !== 'buffer' ? new StringDecoder(enc) : null;
		} catch (err) {
			return cb(err);
		}

		let decodedChunk = decoder != null ? decoder.write(chunk) : chunk;
		this.queue.push(decodedChunk);
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
			str += chunk;
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
