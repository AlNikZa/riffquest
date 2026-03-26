// utils/errorHelpers.js

import { config } from '../config/env.js';
import { AppError } from './AppError.js';

import { cleanEmptyFields } from './plainObjectUtils.js';

const VALID_ERROR_SCOPES = [
	'SYSTEM',
	'EXTERNAL_API',
	'ROUTING',
	'AUTH',
	'SECURITY',
	'VALIDATION',
	'ARTIST',
	'USER',
	'DATABASE',
];

const INTERNAL_FACTORY_ERRORS = {
	invalidKey: (scope, errorKey) => ({
		errorCode: `INVALID_ERROR_KEY_IN_${scope}_ERROR_FACTORY`,
		scope: 'SYSTEM',
		message: 'An unexpected error occurred.',
		devMessage: `Error key "${errorKey}" is not defined in the ${scope.toLowerCase()} errors registry.`,
		statusCode: 500,
		isOperational: false,
	}),
	invalidParams: (scope, errorKey, type) => ({
		errorCode: `INVALID_PARAMS_IN_${scope}_ERROR_FACTORY`,
		scope: 'SYSTEM',
		message: 'An unexpected error occurred.',
		devMessage: `Expected an object for error "${errorKey}", got ${type}.`,
		statusCode: 500,
		isOperational: false,
	}),
};

export const createErrorFactory = (scope, registry) => {
	if (!VALID_ERROR_SCOPES.includes(scope)) {
		throw new Error(
			`Developer Error: Scope "${scope}" is not registered in VALID_ERROR_SCOPES.`,
		);
	}

	return (errorKey, params = {}) => {
		const errorFactory = registry[errorKey];

		if (!errorFactory) {
			return new AppError(
				INTERNAL_FACTORY_ERRORS.invalidKey(scope, errorKey),
			);
		}

		if (typeof params !== 'object' || params === null) {
			return new AppError(
				INTERNAL_FACTORY_ERRORS.invalidParams(
					scope,
					errorKey,
					typeof params,
				),
			);
		}

		const errorData = errorFactory(params);
		errorData.scope = errorData.scope || scope;

		return new AppError(errorData);
	};
};

export const logError = (error) => {
	if (!config.isProd) {
		console.error(`\n--- ERROR LOG ---`);

		const devLogData = {
			name: error.name ?? null,
			status: error.status ?? null,
			scope: error.scope ?? null,
			statusCode: error.statusCode ?? null,
			errorCode: error.errorCode ?? null,
			message: error.message ?? null,
			devMessage: error.devMessage ?? null,
			isOperational: error.isOperational ?? null,
			isFatal: error.isFatal ?? null,
			stack: error.stack ?? null,
			metadata: error.metadata ?? null,
			timestamp: error.timestamp,
		};
		console.error(cleanEmptyFields(devLogData));

		if (error.cause) {
			console.error('--- Original Error Details ---');
			console.error('Original Error:', error.cause);
			if (error.cause?.stack)
				console.error('Original Error Stack:', error.cause.stack);
			if (error.cause?.cause)
				console.error('Original Error Cause:', error.cause.cause);
		}
	} else {
		const prodLogData = {
			timestamp: error.timestamp,
			level: error.status,
			scope: error.scope,
			code: error.errorCode,
			httpStatus: error.statusCode,
			message: error.devMessage || error.message,
			metadata: error.metadata,
			cause: error.cause?.message,
		};

		console.error(JSON.stringify(cleanEmptyFields(prodLogData)));
	}

	if (error.validationErrors && Array.isArray(error.validationErrors)) {
		console.error('--- Validation Errors ---');
		error.validationErrors.forEach((e, index) => {
			if (error.validationErrors.length > 1)
				console.error(`--- Error #${index + 1} ---`);
			Object.entries(e).forEach(([key, value]) => {
				console.error(`${key}: ${value}`);
			});
			if (error.validationErrors.length > 1)
				console.error(`---------------`);
		});
	}
};

export const getFinalMessage = (error) => {
	const fallback = 'An unexpected error occurred. Please try again later.';

	if (config.isProd) {
		return error?.isOperational ? error.message : fallback;
	}
	return error.devMessage || error.message || fallback;
};
