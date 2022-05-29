import { selectColor } from './select-color.js';
import { PrefixTransform } from './prefix-transform.js';

/**
 * Wraps stdout/stderr with a transform stream to add the task name as prefix.
 * @param {stream.Writable} source
 * @param {string} label
 * @returns {stream.Writable}
 */
export function wrapStreamWithLabel(source, label) {
	if (source == null) return source;

	const color = source.isTTY ? selectColor(label) : x => x;
	const prefix = color(`[${label}] `);
	const target = new PrefixTransform(prefix);

	target.pipe(source);

	return target;
}
