// utils/plainObjectUtils.js

export const isPlainObject = (input) =>
	input && typeof input === 'object' && input.constructor === Object;

const isEmptyObject = (obj) =>
	isPlainObject(obj) && Object.keys(obj).length === 0;

export const cleanEmptyFields = (obj, depth = 0) => {
	if (!isPlainObject(obj)) return obj;

	const cleaned = {};
	const keys = Object.keys(obj);

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		let value = obj[key];

		if (value === '' || value === null || value === undefined) continue;

		if (depth > 0 && isPlainObject(value)) {
			value = cleanEmptyFields(value, depth - 1);
		}

		if (Array.isArray(value) && value.length === 0) continue;

		if (isEmptyObject(value)) continue;

		cleaned[key] = value;
	}

	return cleaned;
};
