// services/userTokenService.js

import { config } from '../config/env.js';
// import { spotifyAuthApi } from '../config/axios.js';

import User from '../models/User.js';

export const refreshUserToken = async (refresh_token) => {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token,
  });

  const response = await spotifyAuthApi.post('/token', params, {
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${config.spotify.clientId}:${config.spotify.clientSecret}`,
        ).toString('base64'),
    },
  });

  const data = response.data;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refresh_token,
    expiresIn: data.expires_in || 3600,
  };
};

export const removeTokensForUser = async (spotify_user_id) => {
  await User.updateOne(
    { spotify_user_id: spotify_user_id },
    {
      $unset: {
        access_token: '',
        refresh_token: '',
        token_expires_in: '',
        token_created_timestamp: '',
      },
    },
  );
};
