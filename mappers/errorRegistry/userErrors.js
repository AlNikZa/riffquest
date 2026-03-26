// mappers/errorRegistry/userErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const userErrors = {
	userIdNotFound: ({ spotify_user_id = 'unknown' } = {}) => ({
		message:
			'We couldn’t find your profile. Please try logging in again to sync your account.',
		errorCode: 'USER_NOT_FOUND',
		statusCode: 404,
		devMessage: `No user document found in MongoDB for spotify_id: ${spotify_user_id}`,
		metadata: { spotify_user_id },
	}),
	invalidUserData: ({ cause }) => ({
		message:
			'There was an issue processing your data. Try reconnecting your account.',
		errorCode: 'USER_DATA_INVALID',
		statusCode: 400,
		devMessage: 'Validation failed for user object.',
		cause,
	}),
};

export const createUserError = createErrorFactory('USER', userErrors);
