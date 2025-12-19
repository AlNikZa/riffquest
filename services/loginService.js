// services/loginService.js

import crypto from 'crypto';

import { AppError } from '../middleware/errorHandler.js';

export function buildSpotifyAuthUrl(req) {
  // const scope = 'user-read-private user-read-email';
  const scope =
    'playlist-read-private playlist-read-collaborative user-top-read user-library-read';

  const redirect_uri =
    process.env.NODE_ENV === 'production'
      ? process.env.REDIRECT_URI_PROD
      : process.env.REDIRECT_URI_DEV;

  // Generate a secure random state token
  const state = crypto.randomBytes(16).toString('hex');

  // Store state in the session for later comparison
  req.session.oauthState = state;

  // Build query string using URLSearchParams (modern alternative to querystring)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.CLIENT_ID,
    scope: scope,
    state: state,
    redirect_uri: redirect_uri,
    show_dialog: true, // Ensures user can choose a different Spotify account
  });

  // Final Spotify authorization URL
  const authUrl = 'https://accounts.spotify.com/authorize?' + params.toString();

  return authUrl;
}

export async function exchangeCodeForToken(code, isProduction) {
  // Throw an error if no code is provided
  if (!code)
    throw new AppError('Failed to log in with Spotify. Please try again.', 400);

  // Determine redirect URI based on environment
  // Must match the redirect URI used in /auth/login route
  // Use environment-specific redirect URI
  // Use environment-specific redirect URI
  const redirect_uri = isProduction
    ? process.env.REDIRECT_URI_PROD
    : process.env.REDIRECT_URI_DEV;

  // Build POST parameters for the token exchange request
  const params = new URLSearchParams({
    grant_type: 'authorization_code', // required by Spotify
    code: code, // the code received from Spotify login
    redirect_uri: redirect_uri, // must match /auth/login
  });

  // Make a POST request to Spotify Accounts API to exchange code for tokens
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Spotify requires Basic Auth with Base64 encoded client_id:client_secret
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
        ).toString('base64'),
    },
    body: params.toString(), // send parameters in URL-encoded format
  });

  if (!response.ok) {
    throw new AppError(
      'Failed to log in with Spotify. Please try again.',
      Number(response.status) || 500
    );
  }

  // Parse the JSON response containing the tokens
  const data = await response.json();

  // Handle any errors returned by Spotify
  if (data.error) {
    throw new AppError(
      'Failed to log in with Spotify. Please try again.',
      Number(data.status) || 502
    );
  }

  return data;
}

export function getReturnToCookie(req) {
  const raw = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    raw.split('; ').map((c) => {
      const [key, value] = c.split('=');
      return [key, decodeURIComponent(value)];
    })
  );
  return cookies.returnTo || null;
}
