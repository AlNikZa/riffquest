// services/loginService.js

import { config } from '../config/env.js';

import crypto from 'crypto';

export function buildOAuthUrl(req) {
  const scope =
    'playlist-read-private playlist-read-collaborative user-top-read user-library-read';

  // Generate a secure random state token
  const state = crypto.randomBytes(16).toString('hex');

  // Store state in the session for later comparison
  req.session.oauthState = state;

  // Build query string using URLSearchParams (modern alternative to querystring)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.auth.clientId,
    scope: scope,
    state: state,
    redirect_uri: config.auth.redirectUri,
  });

  // Force the  authorization dialog to appear during development.
  // This allows for easier testing of different user accounts and prevents
  // the browser from automatically logging in the last used account.
  if (!config.isProd) params.set('show_dialog', 'true');

  // Final  authorization URL
  const authUrl = 'https://...' + params.toString();

  return authUrl;
}

export async function exchangeCodeForToken(code) {
  // Build POST parameters for the token exchange request
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.auth.redirectUri, // must match /auth/login
  });

  // Make a POST request to Accounts API to exchange code for tokens
  const response = await OAuthApi.post('/token', params, {
    headers: {
      // requires Basic Auth with Base64 encoded client_id:client_secret
      Authorization:
        'Basic ' +
        Buffer.from(
          `${config.auth.clientId}:${config.auth.clientSecret}`,
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
