// services/globalTokenService.js

// Get Spotify API credentials from environment variables
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Global variables to store the token and refresh timeout
let TOKEN = null;
let REFRESH_TIMEOUT = null;

/* ------------------- Function: getToken -------------------
  Fetches a new Spotify API token using Client Credentials Flow.
  Also sets a timeout to refresh the token automatically before it expires.
------------------------------------------------------------ */
const getToken = async (clientId, clientSecret) => {
  try {
    // Make POST request to Spotify Accounts service
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(clientId + ':' + clientSecret).toString('base64'), // encode credentials
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials', // client credentials flow
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();
    TOKEN = data.access_token; // save the token globally

    // Calculate when the token expires (slightly earlier than actual expiry)
    const tokenExpiresAt = Date.now() + data.expires_in * 1000 - 5000;
    const delay = tokenExpiresAt - Date.now();

    // Clear previous refresh timeout if it exists
    if (REFRESH_TIMEOUT) clearTimeout(REFRESH_TIMEOUT);

    // Schedule automatic token refresh
    REFRESH_TIMEOUT = setTimeout(() => {
      console.log('⏳ Refreshing token automatically...');
      getToken(clientId, clientSecret);
    }, delay);

    return TOKEN;
  } catch (err) {
    console.error('❌ Error in getToken function: ', err);
    throw err;
  }
};

/* ---------------- Function: getCurrentToken ----------------
   Returns the current Spotify API token (null if not yet fetched)
------------------------------------------------------------ */
const getCurrentToken = () => TOKEN;

/* --------- Function: getTokenOrThrowNewAppError ----------
   Checks if the Spotify access token is available in the service.
   If the token is missing, it throws an AppError with a 503 status,
   triggering the global error handler to notify the user.
------------------------------------------------------------ */
export const getTokenOrThrowNewAppError = () => {
  const token = getCurrentToken();
  if (!token) {
    throw new AppError(
      'Spotify token is being fetched. Please wait a moment and try again.',
      503
    );
  }
  return token;
};

/* ------------------- Function: initToken ------------------
   Fetches the token once at server startup.
   Logs success or error to the console.
------------------------------------------------------------ */
export const initToken = async () => {
  try {
    await getToken(clientId, clientSecret);
    console.log('✅ Token fetched successfully at startup');
  } catch (err) {
    console.error('❌ Error fetching token at server startup: ', err);
  }
};
