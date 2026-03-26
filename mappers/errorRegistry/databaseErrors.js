// mappers/errorRegistry/databaseErrors.js;

import { createErrorFactory } from '../../utils/errorHelpers.js';

const databaseErrors = {
	userFetchFailed: ({ cause } = {}) => ({
		message:
			'We are having trouble accessing your profile. Please try again later.',
		errorCode: 'DB_USER_FETCH_FAILED',
		statusCode: 500,
		isOperational: false,
		devMessage: 'Mongoose findOne failed during getUserById execution.',
		cause,
	}),

	userUpsertFailed: ({ cause } = {}) => ({
		message:
			'We encountered a problem while syncing your Spotify profile. Please try logging in again.',
		errorCode: 'DB_USER_UPSERT_FAILED',
		statusCode: 500,
		isOperational: false,
		devMessage: 'findOneAndUpdate failed during Spotify user sync.',
		cause,
	}),
	userUpdateFailed: ({ cause } = {}) => ({
		message:
			'We encountered a problem while syncing your Spotify profile. Please try logging in again.',
		errorCode: 'DB_USER_UPDATE_FAILED',
		statusCode: 500,
		isOperational: false,
		devMessage: 'UpdateOne failed in updateSpotifyUser.',
		cause,
	}),
};

export const createDatabaseError = createErrorFactory(
	'DATABASE',
	databaseErrors,
);
