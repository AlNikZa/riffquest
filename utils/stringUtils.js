//utils/stringUtils.js

export const normalizeString = (str = '') =>
	str
		// 1. Decompose combined characters into base letter + accent mark (e.g., 'é' -> 'e' + '´')
		.normalize('NFD')
		// 2. Remove the separated accent marks (Unicode range for Diacritics)
		.replace(/[\u0300-\u036f]/g, '')
		// 3. Standardize to lowercase
		.toLowerCase()
		// 4. Remove articles "the", "a", "an" as whole words only (\b ensures "they" stays "they")
		.replace(/\b(the|a|an)\b/g, '')
		// 5. Remove all symbols, spaces, and special characters (keep only a-z, 0-9)
		.replace(/[^a-z0-9]/g, '');
