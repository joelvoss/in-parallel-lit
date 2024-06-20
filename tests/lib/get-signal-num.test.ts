import { describe, test, expect } from 'vitest';
import { getSignalNumber } from '../../src/lib/get-signal-num';

describe(`getSignalNumber`, () => {
	test('fallback', () => {
		// @ts-expect-error - Testing fallback
		expect(getSignalNumber()).toBe(0);
	});

	test('all signals', () => {
		expect(getSignalNumber('SIGABRT')).toBe(6);
		expect(getSignalNumber('SIGALRM')).toBe(14);
		expect(getSignalNumber('SIGBUS')).toBe(10);
		expect(getSignalNumber('SIGCHLD')).toBe(20);
		expect(getSignalNumber('SIGCONT')).toBe(19);
		expect(getSignalNumber('SIGFPE')).toBe(8);
		expect(getSignalNumber('SIGHUP')).toBe(1);
		expect(getSignalNumber('SIGILL')).toBe(4);
		expect(getSignalNumber('SIGINT')).toBe(2);
		expect(getSignalNumber('SIGKILL')).toBe(9);
		expect(getSignalNumber('SIGPIPE')).toBe(13);
		expect(getSignalNumber('SIGQUIT')).toBe(3);
		expect(getSignalNumber('SIGSEGV')).toBe(11);
		expect(getSignalNumber('SIGSTOP')).toBe(17);
		expect(getSignalNumber('SIGTERM')).toBe(15);
		expect(getSignalNumber('SIGTRAP')).toBe(5);
		expect(getSignalNumber('SIGTSTP')).toBe(18);
		expect(getSignalNumber('SIGTTIN')).toBe(21);
		expect(getSignalNumber('SIGTTOU')).toBe(22);
		expect(getSignalNumber('SIGUSR1')).toBe(30);
		expect(getSignalNumber('SIGUSR2')).toBe(31);
	});
});
