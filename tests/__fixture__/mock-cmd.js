#!/usr/bin/env node

/**
 * Simple fixture function that can be invoked in unit tests so we don't have
 * to mock out `process.stdout` / `proces.stdin`.
 */
async function main() {
	const cmd = process.argv[2];
	const prefix = process.argv[3] || 'default';
	const delay = Boolean(process.argv[4]) || false;

	if (delay) {
		await new Promise(r => setTimeout(r, 100));
	}

	if (cmd.startsWith('repeat')) {
		const [_, times] = cmd.split('-');

		for (let i = 0; i < times; i++) {
			console.log(`${prefix} - repeat ${i} times`);
			await new Promise(r => setTimeout(r, 1000));
		}
	}

	if (cmd.startsWith('error')) {
		const [_, times] = cmd.split('-');

		for (let i = 0; i < times; i++) {
			if (i === times - 1) {
				console.log(`${prefix} - error`);
				process.exitCode = 1;
				return;
			}

			console.log(`${prefix} - repeat ${i} times`);
			await new Promise(r => setTimeout(r, 1000));
		}
	}
}

main();
