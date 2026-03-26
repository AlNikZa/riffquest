//mappers/errorRegistry/validationErrors.js;

import { createErrorFactory } from '../../utils/errorHelpers.js';

const validationErrors = {
	artistNameRequired: () => ({
		message: 'Please enter an artist name to start the search.',
		errorCode: 'ARTIST_NAME_REQUIRED',
		statusCode: 400,
		devMessage:
			'Validation failed: artist query parameter is missing or null.',
	}),

	invalidArtistFormat: () => ({
		message: 'Please provide a single artist name as text.',
		errorCode: 'INVALID_ARTIST_FORMAT',
		statusCode: 400,
		devMessage:
			'Validation failed: artist query parameter is not a string.',
	}),

	artistNameEmpty: () => ({
		message: 'Artist name cannot be empty.',
		errorCode: 'ARTIST_NAME_EMPTY',
		statusCode: 400,
		devMessage:
			'Validation failed: artist query parameter is an empty string after trim.',
	}),

	validationFailed: ({ validationErrors = [] }) => ({
		message: 'Please check your input and try again.',
		errorCode: 'VALIDATION_FAILED',
		statusCode: 400,
		devMessage: 'express-validator detected invalid request data.',
		validationErrors,
		metadata: {
			errorCount: validationErrors.length,
			fields: validationErrors.map((e) => e.field || 'unknown'),
		},
	}),

	missingRedirectFields: () => ({
		message:
			'Please provide at least one of the following: artist, album, or track.',
		errorCode: 'VALIDATION_MISSING_REDIRECT_FIELDS',
		statusCode: 400,
		devMessage:
			'Validation failed: Redirect route requires at least one search parameter (artist, album, or track).',
	}),
};

export const createValidationError = createErrorFactory(
	'VALIDATION',
	validationErrors,
);
