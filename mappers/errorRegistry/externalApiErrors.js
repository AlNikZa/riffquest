// mappers/errorRegistry/externalApiErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const externalApiErrors = {
  apiError: ({
    context = 'External API',
    message,
    statusCode,
    retryAfter,
    cause,
  }) => ({
    message,
    errorCode: `${context.replace(/\s+/g, '_').toUpperCase()}_${statusCode}_ERROR`,
    statusCode,
    devMessage: `External API failure from [${context}] with status ${statusCode}.`,
    metadata: {
      context,
      retryAfter,
    },
    cause,
  }),
};

export const createExternalApiError = createErrorFactory(
  'EXTERNAL_API',
  externalApiErrors,
);
