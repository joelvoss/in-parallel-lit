let FORCE_COLOR: string | undefined;
let NODE_DISABLE_COLORS: string | undefined;
let NO_COLOR: string | undefined;
let TERM: string | undefined;
let isTTY = true;
let enabled: boolean;

////////////////////////////////////////////////////////////////////////////////

/**
 * Check if color support is enabled.
 */
function checkColorSupport() {
	if (enabled != null) return;

	({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env);
	isTTY = process.stdout?.isTTY;

	enabled =
		!NODE_DISABLE_COLORS &&
		NO_COLOR == null &&
		TERM !== 'dumb' &&
		((FORCE_COLOR != null && FORCE_COLOR !== '0') || isTTY);
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Returns functions that wrap a given string with color char codes.
 */
function createColor(x: number, y: number) {
	const rgx = new RegExp(`\\x1b\\[${y}m`, 'g');
	const open = `\x1b[${x}m`;
	const close = `\x1b[${y}m`;

	return function (txt: string) {
		checkColorSupport();

		if (!enabled) return txt;
		return (
			open +
			(~`${txt}`.indexOf(close) ? txt.replace(rgx, close + open) : txt) +
			close
		);
	};
}

////////////////////////////////////////////////////////////////////////////////

const colors = [
	createColor(36, 39), // cyan
	createColor(32, 39), // green
	createColor(35, 39), // magenta
	createColor(33, 39), // yellow
	createColor(31, 39), // red
];

let colorIndex = 0;
const taskNamesToColors = new Map<string, ReturnType<typeof createColor>>();

/**
 * Select a color from given task name.
 */
export function selectColor(taskName: string) {
	let color = taskNamesToColors.get(taskName);
	if (color == null) {
		color = colors[colorIndex];
		colorIndex = (colorIndex + 1) % colors.length;
		taskNamesToColors.set(taskName, color);
	}
	return color;
}
