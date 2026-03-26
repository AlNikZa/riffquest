// services/loginService.js

import { config } from '../config/env.js';

import crypto from 'crypto';

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
  });

  // Force the Spotify authorization dialog to appear during development.
  // This allows for easier testing of different user accounts and prevents
  // the browser from automatically logging in the last used account.
  if (!config.isProd) params.set('show_dialog', 'true');

  // Final Spotify authorization URL
  const authUrl = 'https://accounts.spotify.com/authorize?' + params.toString();

  return authUrl;
}

export async function exchangeCodeForToken(code) {
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

function getReturnToCookie(req) {
  // consider using cookie-parser
  const raw = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    raw.split('; ').map((c) => {
      const [key, value] = c.split('=');
      return [key, decodeURIComponent(value)];
    }),
  );
  return cookies.returnTo || null;
}

export const getSafeRedirect = (req) => {
  const url = getReturnToCookie(req) || config.appBaseUrl || '/';
  return url.startsWith('/') && !url.startsWith('//') ? url : '/';
};
