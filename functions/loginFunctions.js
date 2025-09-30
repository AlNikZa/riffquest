// Function to exchange Spotify authorization code for access and refresh tokens
export async function exchangeCodeForToken(code, isProduction) {
  // Throw an error if no code is provided
  if (!code) throw new Error('No authorization code provided');

  // Determine redirect URI based on environment
  // Must match the redirect URI used in /login route
  const redirect_uri = isProduction
    ? 'https://riffquest.onrender.com/callback'
    : 'http://127.0.0.1:3000/callback';

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

  // Return the token data:
  // data.access_token → used for API requests on behalf of the user
  // data.refresh_token → used to refresh the access token when it expires
  // data.expires_in → duration of the access token in seconds
  return data;
}
