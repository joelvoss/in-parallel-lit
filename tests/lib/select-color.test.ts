import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { selectColor } from '../../src/lib/select-color';

describe(`selectColor`, () => {
	beforeEach(() => {
		vi.stubEnv('FORCE_COLOR', '1');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test('default', () => {
		const color1 = selectColor('first-task');
		const color2 = selectColor('second-task');
		const color3 = selectColor('first-task');

		expect(color1(`test`)).toMatchInlineSnapshot(`"\x1b[36mtest\x1b[39m"`);
		expect(Buffer.from(color1(`test`))).toMatchInlineSnapshot(`
		{
		  "data": [
		    27,
		    91,
		    51,
		    54,
		    109,
		    116,
		    101,
		    115,
		    116,
		    27,
		    91,
		    51,
		    57,
		    109,
		  ],
		  "type": "Buffer",
		}
	`);

		expect(color2(`test`)).toMatchInlineSnapshot(`"\x1b[32mtest\x1b[39m"`);
		expect(Buffer.from(color2(`test`))).toMatchInlineSnapshot(`
		{
		  "data": [
		    27,
		    91,
		    51,
		    50,
		    109,
		    116,
		    101,
		    115,
		    116,
		    27,
		    91,
		    51,
		    57,
		    109,
		  ],
		  "type": "Buffer",
		}
	`);
		expect(color1).toBe(color3);
		expect(color1).not.toBe(color2);
	});
});
