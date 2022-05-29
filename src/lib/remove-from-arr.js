/**
 * removeFromArr removes an `item` from `arr`.
 * @param {any[]} arr
 * @param {any} item
 */
export function removeFromArr(arr, item) {
	const index = arr.indexOf(item);
	if (index !== -1) {
		arr.splice(index, 1);
	}
}
