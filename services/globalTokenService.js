// services/globalTokenService.js

import { config } from '../config/env.js';
import { spotifyAuthApi } from '../config/axios.js';
import { AppError } from '../utils/AppError.js';

// Get Spotify API credentials from configuration object
const clientId = config.spotify.clientId;
const clientSecret = config.spotify.clientSecret;

let TOKEN = null;
let TOKEN_EXPIRES_AT = 0; // timestamp in MS
let refreshPromise = null; // Shared in-flight promise to prevent parallel token refresh requests

/* ------------------- Function: fetchNewToken -------------------
  Performs the actual HTTP request to Spotify's Auth API.
  Uses Client Credentials Flow to secure a new access token.
------------------------------------------------------------ */
const fetchNewToken = async (clientId, clientSecret) => {
  const result = await spotifyAuthApi.post(
    '/token',
    'grant_type=client_credentials', //request body
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
    },
  );

  const data = result.data;
  TOKEN = data.access_token; // save the token globally

  // Calculate when the token expires (slightly earlier than actual expiry)
  const ttl = Number(data.expires_in) - 300 || 60 * 55;
  TOKEN_EXPIRES_AT = Date.now() + ttl * 1000;

  if (!config.isProd) {
    console.log(
      `✅ New Token Fetched. Expires at: ${new Date(TOKEN_EXPIRES_AT).toLocaleTimeString()}`,
    );
  }
  return TOKEN;
};

/* --------- Function: getOrRefreshSpotifyToken ----------
   Returns a valid cached token if available.
   If a refresh is already in progress, returns the same in-flight Promise.
   Guarantees a single token refresh at any time.
------------------------------------------------------------ */
export const getOrRefreshSpotifyToken = async () => {
  //  ex getTokenOrThrowNewAppError
  const now = Date.now();

  // 1. Return valid token if available
  if (TOKEN && now < TOKEN_EXPIRES_AT) {
    return TOKEN;
  }

  // 2. Wait if another process is already fetching a new token
  if (refreshPromise) {
    console.log('⏳ Token refresh already in progress, waiting...');
    return refreshPromise;
  }

  // 3. Initiate token refresh sequence
  console.log('🔄 Token missing or expired. Fetching fresh token...');
  refreshPromise = fetchNewToken(clientId, clientSecret).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

/* ------------------- Function: initToken ------------------
   Initializes the token service once at server startup.
   Ensures the application is ready to handle API requests immediately.
------------------------------------------------------------ */

export const initToken = async () => {
  try {
    await fetchNewToken(clientId, clientSecret);
  } catch (err) {
    console.warn(
      '⚠️ Initial token fetch failed. Will retry on first user request.',
    );
  }
};
