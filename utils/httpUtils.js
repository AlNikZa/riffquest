// utils/httpUtils.js

export const parseCode = (statusCode) => {
	const parsedCode = Number(statusCode);
	return Number.isInteger(parsedCode) &&
		parsedCode >= 100 &&
		parsedCode <= 599
		? parsedCode
		: 500;
};
