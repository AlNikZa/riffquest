// Function to exchange Spotify authorization code for access and refresh tokens
export async function exchangeCodeForToken(code, isProduction) {
  // Throw an error if no code is provided
  if (!code) throw new Error('No authorization code provided');

  // Determine redirect URI based on environment
  // Must match the redirect URI used in /login route
  // Use environment-specific redirect URI
  // Use environment-specific redirect URI
  const redirect_uri = isProduction
    ? process.env.REDIRECT_URI_PROD
    : process.env.REDIRECT_URI_DEV;

  // Build POST parameters for the token exchange request
  const params = new URLSearchParams({
    grant_type: 'authorization_code', // required by Spotify
    code: code, // the code received from Spotify login
    redirect_uri: redirect_uri, // must match /login
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

  // Parse the JSON response containing the tokens
  const data = await response.json();

  // Handle any errors returned by Spotify
  if (data.error) {
    throw new Error(data.error_description || 'Spotify token exchange failed');
  }

  return data;
}
export const setReturnToCookie = (req, res, next) => {
  // Only handle GET requests that are not for /login or /callback
  if (
    req.method === 'GET' &&
    !req.originalUrl.startsWith('/login') &&
    !req.originalUrl.startsWith('/callback')
  ) {
    // Construct the full current URL
    const currentURL = req.protocol + '://' + req.get('host') + req.originalUrl;

    // Check if the app is running in production mode
    const isProd = process.env.NODE_ENV === 'production';
    const secureFlag = isProd ? 'Secure; ' : '';

    // Set a cookie named 'returnTo' with the current URL
    res.cookie('returnTo', currentURL, {
      httpOnly: true,
      maxAge: 6000 * 1000,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }

  // Continue to the next middleware or route
  next();
};

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
