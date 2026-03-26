// mappers/errorRegistry/securityErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const securityErrors = {
	sessionMissing: () => ({
		message:
			'Something went wrong while loading the page. Please refresh and try again.',
		errorCode: 'SESSION_MISSING',
		statusCode: 500,
		devMessage: 'Session object is missing in CSRF middleware.',
	}),

	sessionExpired: ({ session = null, csrfToken = null }) => ({
		message:
			'Your session may have expired. Please refresh the page and try again.',
		errorCode: 'SESSION_EXPIRED',
		statusCode: 403,
		devMessage: 'Session or CSRF token missing during validation.',
		metadata: {
			hasSession: !!session,
			hasCsrfToken: !!csrfToken,
		},
	}),

	csrfTokenMissing: () => ({
		message:
			'Your session has timed out. Please refresh the page before submitting.',
		errorCode: 'CSRF_TOKEN_MISSING',
		statusCode: 403,
		devMessage: 'CSRF token not found in request body or headers.',
	}),

	invalidCsrfToken: ({
		method = null,
		path = null,
		hasBodyToken = false,
		hasHeaderToken = false,
	}) => ({
		message:
			'We couldn’t verify your request. This usually happens if the page was open too long—please refresh and try again.',
		errorCode: 'INVALID_CSRF_TOKEN',
		statusCode: 403,
		devMessage: `CSRF mismatch. Method: ${method}, Path: ${path}`,
		metadata: { method, path, hasBodyToken, hasHeaderToken },
	}),
};

export const createSecurityError = createErrorFactory(
	'SECURITY',
	securityErrors,
);
