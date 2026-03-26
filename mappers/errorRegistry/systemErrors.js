// mappers/errorRegistry/systemErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const systemErrors = {
	unexpectedError: ({
		errorName = 'Error',
		errorMessage = 'unknown',
		originalUrl = 'unknown',
		method = 'unknown',
		cause = {},
	}) => ({
		message: 'An unexpected error occurred. Please try again later.',
		errorCode: 'UNEXPECTED_SERVER_ERROR',
		devMessage: `Original [${errorName}]: ${errorMessage}`,
		isOperational: false,
		statusCode: 500,
		metadata: {
			errorName,
			errorMessage,
			path: originalUrl,
			method,
		},
		cause,
	}),

	invalidEncryptionInput: ({ encryptionInputType }) => ({
		message:
			'We encountered an issue while processing your data. Please try again.',
		errorCode: 'INVALID_ENCRYPTION_INPUT',
		statusCode: 500,
		isOperational: false,
		devMessage: `Encryption failed: Expected string, but received ${encryptionInputType}. Check the service calling encrypt().`,
		metadata: { encryptionInputType },
	}),

	encryptionFailed: ({ cause }) => ({
		message:
			'A secure connection could not be established. Please try again.',
		errorCode: 'ENCRYPTION_FAILED',
		statusCode: 500,
		isOperational: false,
		devMessage:
			'Crypto.createCipheriv or cipher.final failed. Check encryption key/IV length.',
		cause,
	}),
};

export const createSystemError = createErrorFactory('SYSTEM', systemErrors);
