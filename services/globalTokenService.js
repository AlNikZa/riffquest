// services/globalTokenService.js

import { AppError } from '../middleware/errorHandler.js';

// Get Spotify API credentials from environment variables
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

let TOKEN = null;
let TOKEN_EXPIRES_AT = 0; // timestamp in MS
let isRefreshing = false; // flag to prevent multiple concurrent API calls

/* ------------------- Function: fetchNewToken -------------------
  Performs the actual HTTP request to Spotify's Auth API.
  Uses Client Credentials Flow to secure a new access token.
------------------------------------------------------------ */

const fetchNewToken = async (clientId, clientSecret) => {
  try {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!result.ok) {
      const errorResponse = await result.json();
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Spotify Auth Error:', errorResponse);
      }

      throw new AppError(
        `Spotify Auth failed: ${
          errorResponse.error_description || result.statusText
        }`,
        result.status
      );
    }

    const data = await result.json();
    TOKEN = data.access_token; // save the token globally

    // Calculate when the token expires (slightly earlier than actual expiry)
    TOKEN_EXPIRES_AT = Date.now() + 1000 * 60 * 55;

    return TOKEN;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Spotify Token Service Error:', err);
    }

    if (err instanceof AppError) throw err;

    throw new AppError(
      'Internal error during Spotify token fetch',
      err.status || 500
    );
  }
};

/* --------- Function: getTokenOrThrowNewAppError ----------
   Returns the cached token if valid; otherwise, triggers a refresh.
   Includes a mutex-like wait for concurrent requests.
------------------------------------------------------------ */

export const getTokenOrThrowNewAppError = async () => {
  const now = Date.now();

  // 1. Return valid token if available
  if (TOKEN && now < TOKEN_EXPIRES_AT) {
    return TOKEN;
  }

  // 2. Wait if another process is already fetching a new token
  if (isRefreshing) {
    console.log('⏳ Token refresh already in progress, waiting...');
    await new Promise((resolve) => setTimeout(resolve, 500)); // Pause for 0.5s
    if (TOKEN) return TOKEN;
  }

  // 3. Initiate token refresh sequence
  isRefreshing = true;
  try {
    console.log('🔄 Token missing or expired. Fetching fresh token...');
    await fetchNewToken(clientId, clientSecret);

    if (!TOKEN) {
      throw new AppError(
        'Spotify service unavailable. Failed to secure access token.',
        503
      );
    }

    return TOKEN;
  } finally {
    // Ensure flag is reset regardless of fetch outcome
    isRefreshing = false;
  }
};

/* ------------------- Function: initToken ------------------
   Initializes the token service once at server startup.
   Ensures the application is ready to handle API requests immediately.
------------------------------------------------------------ */

export const initToken = async () => {
  try {
    await fetchNewToken(clientId, clientSecret);
    console.log('✅ Token fetched successfully at startup');
  } catch (err) {
    console.warn(
      '⚠️ Initial token fetch failed. Will retry on first user request.'
    );
  }
};
