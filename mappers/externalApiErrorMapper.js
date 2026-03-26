// mappers/externalApiErrorMapper.js

import { parseCode } from '../utils/httpUtils.js';
import { secondsToReadableTime } from '../utils/timeUtils.js';

import { createExternalApiError } from './errorRegistry/externalApiErrors.js';

export const mapExternalApiError = (err, context) => {
  let statusCode;
  const retryAfter = err.response?.headers?.['retry-after'];

  // 503 Network, DNS, Timout
  if (!err.response) {
    statusCode = 503;
  } else {
    statusCode = parseCode(err.response?.status);
  }

  const messages = {
    401: `Your ${context} session has expired. Please log in again.`,
    403: `This ${context} feature is not available for your account.`,
    404: `The requested content was not found on ${context}.`,
    429: `Too many requests. Please try again ${retryAfter ? `in ${secondsToReadableTime(retryAfter)}` : 'soon'}.`,
    500: `${context} is currently experiencing issues. Please refresh or try again later.`,
    503: `${context} is temporarily unavailable. Please try again in a moment.`,
  };
  const message =
    messages[statusCode] ||
    `Something went wrong with ${context}. Please try again later.`;

  // return object, do not throw error here
  return createExternalApiError('apiError', {
    context,
    message,
    statusCode,
    retryAfter: retryAfter ? secondsToReadableTime(retryAfter) : null,
    cause: err,
  });
};
