// mappers/externalApiErrorMapper.js

import { AppError } from '../AppError.js';

export const mapSpotifyError = (err, context = 'Spotify API') => {
  let message;
  let statusCode;

  // 503 Network, DNS, Timout
  if (!err.response) {
    statusCode = 503;
    message = `${context} is unreachable or request timed out.`;
  } else {
    statusCode = err.response?.status || 500;

    switch (statusCode) {
      case 401:
        message = `${context} authorization failed.`;
        break;
      case 429:
        const retryAfter = err.response.headers['retry-after'];
        message = retryAfter
          ? `${context} rate limit exceeded. Retry after ${retryAfter} seconds.`
          : `${context} rate limit exceeded.`;
        break;
      default:
        message =
          err.response.data?.error?.message ||
          `Failed to fetch data from ${context}.`;
    }
  }

  // return object, do not throw error here
  return new AppError(message, statusCode);
};
