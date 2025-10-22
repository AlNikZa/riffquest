import User from '../models/User.js';
import { updateSpotifyUser } from './userFunctions.js';

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

  if (!response.ok) {
    throw new Error(
      `❌ Spotify user token refresh failed in refreshUserToken function: ${response.status}`
    );
  }
  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refresh_token,
    expiresIn: data.expires_in || 3600,
  };
};

export const scheduleUserTokenRefresh = async (
  spotify_user_id,
  refresh_token
) => {
  try {
    const updatedUserTokens = await refreshUserToken(refresh_token);
    const timeout = updatedUserTokens.expiresIn * 1000 - 3000;
    await updateSpotifyUser(updatedUserTokens, spotify_user_id);

    setTimeout(() => {
      scheduleUserTokenRefresh(spotify_user_id, updatedUserTokens.refreshToken);
    }, timeout);
  } catch (err) {
    console.error(
      `❌ Error in scheduleUserTokenRefresh function- Failed to refresh token for user: `,
      err
    );
  }
};

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
    console.error('❌ Error in removeTokensForUser function: ', err); // Log any errors
  }
};
