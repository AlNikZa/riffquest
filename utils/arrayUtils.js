// utils/arrayUtils.js

// Splits an array into smaller sub-arrays (chunks) of a specified maximum size
export const chunkArray = (array, size) => {
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
};

// Removes duplicate objects from an array based on a unique property key (e.g., 'id')
export const uniqueBy = (array, key) => {
	return Array.from(new Map(array.map((item) => [item[key], item])).values());
};

// Sorts objects by their numeric property in ascending order without mutating the original array
export const sortByNumericProperty = (array, key) =>
	[...array].sort((a, b) => Number(a[key]) - Number(b[key]));
