// mappers/errorRegistry/routingErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const routingErrors = {
	nothingFound: ({
		method = 'UNKNOWN_METHOD',
		originalUrl = 'UNKNOWN_URL',
	}) => ({
		message: 'We couldn’t find the page you’re looking for.',
		errorCode: 'NOTHING_FOUND',
		statusCode: 404,
		devMessage: `${method} ${originalUrl} does not exist in API routes.`,
		metadata: {
			method,
			originalUrl,
		},
	}),
	// TODO: methodNotAllowed: {}, (when needed...)
};

export const createRoutingError = createErrorFactory('ROUTING', routingErrors);
