// services/loginService.js

import { config } from '../config/env.js';

import crypto from 'crypto';

import { AppError } from '../AppError.js';
import { spotifyAuthApi } from '../config/axios.js';

export function buildSpotifyAuthUrl(req) {
  const scope =
    'playlist-read-private playlist-read-collaborative user-top-read user-library-read';

  // Generate a secure random state token
  const state = crypto.randomBytes(16).toString('hex');

  // Store state in the session for later comparison
  req.session.oauthState = state;

  // Build query string using URLSearchParams (modern alternative to querystring)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.spotify.clientId,
    scope: scope,
    state: state,
    redirect_uri: config.spotify.redirectUri,
    show_dialog: true, // Ensures user can choose a different Spotify account
  });

  // Final Spotify authorization URL
  const authUrl = 'https://accounts.spotify.com/authorize?' + params.toString();

  return authUrl;
}

export async function exchangeCodeForToken(code) {
  // Throw an error if no code is provided
  if (!code)
    throw new AppError('Failed to log in with Spotify. Please try again.', 400);

  // Build POST parameters for the token exchange request
  const params = new URLSearchParams({
    grant_type: 'authorization_code', // required by Spotify
    code: code, // the code received from Spotify login
    redirect_uri: config.spotify.redirectUri, // must match /auth/login
  });

  // Make a POST request to Spotify Accounts API to exchange code for tokens
  const response = await spotifyAuthApi.post('/token', params, {
    headers: {
      // Spotify requires Basic Auth with Base64 encoded client_id:client_secret
      Authorization:
        'Basic ' +
        Buffer.from(
          `${config.spotify.clientId}:${config.spotify.clientSecret}`,
        ).toString('base64'),
    },
  });

  // Parse the JSON response containing the tokens
  const data = response.data;

  return data; // token
}

export function getReturnToCookie(req) {
  const raw = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    raw.split('; ').map((c) => {
      const [key, value] = c.split('=');
      return [key, decodeURIComponent(value)];
    }),
  );
  return cookies.returnTo || null;
}
