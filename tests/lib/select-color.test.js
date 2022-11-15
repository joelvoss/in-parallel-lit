import { selectColor } from '../../src/lib/select-color';

describe(`selectColor`, () => {
	test('default', () => {
		const color1 = selectColor('first-task');
		const color2 = selectColor('second-task');
		const color3 = selectColor('first-task');

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
