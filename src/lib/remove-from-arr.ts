/**
 * removeFromArr removes an `item` from `arr`.
 */
export function removeFromArr(arr: unknown[], item: unknown) {
	const index = arr.indexOf(item);
	if (index !== -1) {
		arr.splice(index, 1);
	}
}
