#!/usr/bin/env node

import { createRequire } from 'module';
import sade from 'sade';
import { prog } from './index.js';

async function run(argv) {
	const require = createRequire(import.meta.url);
	const packageJson = require('../package.json');

	// NOTE(joel): Avoid `MaxListenersExceededWarnings`.
	process.stdout.setMaxListeners(0);
	process.stderr.setMaxListeners(0);
	process.stdin.setMaxListeners(0);

	sade('in-parallel', true)
		.version(packageJson.version)
		.describe(packageJson.description)
		.option(
			'-c, --continue-on-error',
			`Set the flag to continue executing other/subsequent tasks even if a task threw an error. 'in-parallel' itself will exit with non-zero code if one or more tasks threw error(s).`,
		)
		.option(
			'--max-parallel',
			`Set the maximum number of parallelism. Default is unlimited.`,
			0,
		)
		.option(
			'--aggregate-output',
			`Avoid interleaving output by delaying printing of each command's output until it has finished.`,
			false,
		)
		.action(opts => prog(opts, process))
		.parse(argv);
}

run(process.argv);
