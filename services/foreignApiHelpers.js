// services/foreignApiHelpers.js

import { AppError } from '../AppError.js';

// for axios
export const handleSpotifyError = (err, context = 'Spotify API') => {
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

//for fetch
// Temporary helper used until all Spotify fetch calls are migrated to Axios
export const checkSpotifyResponse = (response) => {
  if (!response) throw new AppError('No response from Spotify API', 503);

  if (response.ok) return;

  if (response.status === 401)
    throw new AppError('Spotify authorization failed.', 401);

  if (response.status === 429) {
    let message = 'Spotify rate limit exceeded. Please try again later.';

    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      message = `Spotify rate limit exceeded. Retry after ${retryAfter} seconds.`;
    }
    throw new AppError(message, 429);
  }

  throw new AppError('Failed to fetch data from Spotify.', response.status);
};
