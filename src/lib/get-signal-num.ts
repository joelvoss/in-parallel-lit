const signals: Record<string, number> = {
	SIGABRT: 6,
	SIGALRM: 14,
	SIGBUS: 10,
	SIGCHLD: 20,
	SIGCONT: 19,
	SIGFPE: 8,
	SIGHUP: 1,
	SIGILL: 4,
	SIGINT: 2,
	SIGKILL: 9,
	SIGPIPE: 13,
	SIGQUIT: 3,
	SIGSEGV: 11,
	SIGSTOP: 17,
	SIGTERM: 15,
	SIGTRAP: 5,
	SIGTSTP: 18,
	SIGTTIN: 21,
	SIGTTOU: 22,
	SIGUSR1: 30,
	SIGUSR2: 31,
};

/**
 * Converts a signal name to a number.
 */
export function getSignalNumber(signal: string) {
	return signals[signal] || 0;
}
