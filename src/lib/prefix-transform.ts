import { Transform, type TransformCallback } from 'node:stream';

const ALL_BR = /\n/g;

export class PrefixTransform extends Transform {
	prefix: string;
	lastPrefix: string | null;
	lastIsLinebreak: boolean;

	constructor(prefix: string) {
		super();
		this.prefix = prefix;
		this.lastPrefix = null;
		this.lastIsLinebreak = true;
	}

	_transform(chunk: unknown, _enc: BufferEncoding, cb: TransformCallback) {
		const firstPrefix = this.lastIsLinebreak
			? this.prefix
			: this.lastPrefix !== this.prefix
				? '\n'
				: '';
		const prefixed = `${firstPrefix}${chunk}`.replace(
			ALL_BR,
			`\n${this.prefix}`,
		);
		const index = prefixed.indexOf(
			this.prefix,
			Math.max(0, prefixed.length - this.prefix.length),
		);

		this.lastPrefix = this.prefix;
		this.lastIsLinebreak = index !== -1;

		cb(null, index !== -1 ? prefixed.slice(0, index) : prefixed);
	}
}
