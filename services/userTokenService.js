// services/userTokenService.js

import User from '../models/User.js';
import { updateSpotifyUser } from './userService.js';

const checkSpotifyResponse = (response) => {
  if (response.ok) return;

  if (response.status === 401)
    throw new AppError('Spotify authorization failed.', 401);

  if (response.status === 429)
    throw new AppError(
      'Spotify rate limit exceeded. Please try again later.',
      429
    );

  throw new AppError('Failed to fetch data from Spotify.', response.status);
};

export const refreshUserToken = async (refresh_token) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
  });

  checkSpotifyResponse(response);

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refresh_token,
    expiresIn: data.expires_in || 3600,
  };
};

// export const scheduleUserTokenRefresh = async (
//   spotify_user_id,
//   refresh_token
// ) => {
//   try {
//     const updatedUserTokens = await refreshUserToken(refresh_token);
//     const timeout = updatedUserTokens.expiresIn * 1000 - 3000;
//     await updateSpotifyUser(updatedUserTokens, spotify_user_id);

//     setTimeout(() => {
//       scheduleUserTokenRefresh(spotify_user_id, updatedUserTokens.refreshToken);
//     }, timeout);
//   } catch (err) {
//     console.error(
//       `❌ Error in scheduleUserTokenRefresh function- Failed to refresh token for user: `,
//       err
//     );
//   }
// };

export const removeTokensForUser = async (spotify_user_id) => {
  try {
    await User.updateOne(
      { spotify_user_id: spotify_user_id },
      {
        $unset: {
          access_token: '',
          refresh_token: '',
          token_expires_in: '',
          token_created_timestamp: '',
        },
      }
    );
  } catch (err) {
    throw err;
  }
};
