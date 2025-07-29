import { describe, expect, test } from 'vitest';
import { removeFromArr } from '../../src/lib/remove-from-arr';

describe(`removeFromArr`, () => {
	test('default', () => {
		const arr = ['a', 2, 'c'];
		removeFromArr(arr, 2);
		expect(arr).toEqual(['a', 'c']);
	});

	test('item not found', () => {
		const arr = ['a', 2, 'c'];
		removeFromArr(arr, 'not-found');
		expect(arr).toEqual(arr);
	});
});
