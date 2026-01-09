// services/userTokenService.js

import { config } from '../config/env.js';

import User from '../models/User.js';

import { checkSpotifyResponse } from '../services/foreignApiHelpers.js';

export const refreshUserToken = async (refresh_token) => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          `${config.spotify.clientId}:${config.spotify.clientSecret}`
        ).toString('base64'),
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
    }
  );
};
