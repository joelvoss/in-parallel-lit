import type { stderr, stdin, stdout } from 'node:process';
import type { Readable, Writable } from 'node:stream';

/**
 * Converts a given stream to an option for `child_process.spawn`.
 */
export function getStreamKind(
	stream: Readable | Writable | null,
	std?: typeof stdin | typeof stdout | typeof stderr,
) {
	if (stream == null) return 'ignore';
	// NOTE(joel): `|| !std.isTTY` is needed for the workaround of
	// https://github.com/nodejs/node/issues/5620
	if (stream !== std || !std.isTTY) return 'pipe';
	return stream;
}
