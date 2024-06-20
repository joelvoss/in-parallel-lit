import { selectColor } from './select-color';
import { PrefixTransform } from './prefix-transform';
import type { Writable } from 'stream';

/**
 * Wraps stdout/stderr with a transform stream to add the task name as prefix.
 */
export function wrapStreamWithLabel(source: Writable | null, label: string) {
	if (source == null) return source;

	// @ts-expect-error - `isTTY` is not defined in the type definition.
	const color = source.isTTY ? selectColor(label) : (x: string) => x;
	const prefix = color(`[${label}] `);
	const target = new PrefixTransform(prefix);

	target.pipe(source);

	return target;
}
