// mappers/errorRegistry/authErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const authErrors = {
	oauthStateMismatch: ({ received, expected } = {}) => ({
		message: 'Login process failed. Please start the login process again.',
		errorCode: 'OAUTH_STATE_MISMATCH',
		statusCode: 403,
		devMessage:
			'Security check failed: OAuth state parameter is missing or does not match req.session.oauthState.',
		metadata: {
			receivedState: received,
			expectedState: expected,
		},
	}),

	tokenExchangeFailed: ({ query } = {}) => ({
		message:
			'We could not complete the login with Spotify. Please try again',
		errorCode: 'TOKEN_EXCHANGE_FAILED',
		statusCode: 500,
		devMessage: 'Spotify OAuth token exchange failed.',
		metadata: {
			query: query || null,
		},
	}),

	logoutFailed: ({ cause } = {}) => ({
		message: 'Something went wrong during logout. Please try again.',
		errorCode: 'AUTH_LOGOUT_FAILURE',
		statusCode: 500,
		devMessage: 'Session destruction failed on the server during logout.',
		cause,
	}),

	invalidDecryptionInput: ({ decryptionInputType } = {}) => ({
		message: 'Your session is invalid. Please log in again.',
		errorCode: 'INVALID_DECRYPTION_INPUT',
		statusCode: 401,
		isOperational: true,
		devMessage: `Decryption failed: Input was not a valid string (got ${decryptionInputType}).`,
		metadata: {
			decryptionInputType,
		},
	}),

	decryptionFailed: ({ inputLength, cause } = {}) => ({
		message: 'Session expired or corrupted. Please log in again.',
		errorCode: 'DECRYPTION_FAILED',
		statusCode: 401,
		isOperational: true,
		devMessage:
			'Failed to decrypt the provided token. This usually means the token was tampered with, the IV is missing, or the encryption key has changed.',
		metadata: { inputLength },
		cause,
	}),
};

const authLogOnlyErrors = {
	unauthorizedCleanupFailure: ({ cause, metadata = {} }) => ({
		errorCode: 'UNAUTHORIZED_CLEANUP_FAILURE',
		isOperational: false,
		statusCode: 401,
		devMessage:
			'Critical failure during unauthorized user cleanup. Check token service and session store.',
		metadata: {
			userId: metadata.spotifyUserId,
			sessionId: metadata.sessionId,
			path: metadata.originalUrl,
			ip: metadata.ip,
			userAgent: metadata.userAgent,
			referer: metadata.referer,
			method: metadata.method,
		},
		cause,
	}),

	userTokenRemovingError: ({ cause, userId } = {}) => ({
		errorCode: 'USER_TOKEN_CLEANUP_FAILURE',
		isOperational: false,
		statusCode: 500,
		devMessage: `Failed to remove Spotify tokens from database during logout for user: ${userId}`,
		metadata: {
			userId,
		},
		cause,
	}),
};

export const createAuthError = createErrorFactory('AUTH', authErrors);

export const createLogOnlyAuthError = createErrorFactory(
	'AUTH',
	authLogOnlyErrors,
);
