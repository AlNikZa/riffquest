// services/foreignApiHelpers.js

import { AppError } from '../AppError.js';

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
