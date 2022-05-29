/**
 * Converts a given stream to an option for `child_process.spawn`.
 * @param {stream.Readable|stream.Writable|null} stream
 * @param {process.stdin|process.stdout|process.stderr} std
 * @returns {string|stream.Readable|stream.Writable}
 */
export function getStreamKind(stream, std) {
	if (stream == null) return 'ignore';
	// NOTE(joel): `|| !std.isTTY` is needed for the workaround of
	// https://github.com/nodejs/node/issues/5620
	if (stream !== std || !std.isTTY) return 'pipe';
	return stream;
}
