let FORCE_COLOR;
let NODE_DISABLE_COLORS;
let NO_COLOR;
let TERM;
let isTTY = true;

if (typeof process !== 'undefined') {
	({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env);
	isTTY = process.stdout && process.stdout.isTTY;
}

const enabled =
	!NODE_DISABLE_COLORS &&
	NO_COLOR == null &&
	TERM !== 'dumb' &&
	((FORCE_COLOR != null && FORCE_COLOR !== '0') || isTTY);

////////////////////////////////////////////////////////////////////////////////

/**
 * Returns functions that wrap a given string with color char codes.
 * @param {number} x
 * @param {number} y
 * @returns {(txt: string) => string}
 */
function createColor(x, y) {
	const rgx = new RegExp(`\\x1b\\[${y}m`, 'g');
	const open = `\x1b[${x}m`;
	const close = `\x1b[${y}m`;

	return function (txt) {
		if (!enabled || txt == null) return txt;
		return (
			open +
			(~('' + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) +
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
const taskNamesToColors = new Map();

/**
 * Select a color from given task name.
 * @param {string} taskName
 * @returns {(txt: string) => string}
 */
export function selectColor(taskName) {
	let color = taskNamesToColors.get(taskName);
	if (color == null) {
		color = colors[colorIndex];
		colorIndex = (colorIndex + 1) % colors.length;
		taskNamesToColors.set(taskName, color);
	}
	return color;
}
