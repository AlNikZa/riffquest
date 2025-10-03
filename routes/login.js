import express from 'express';
import { exchangeCodeForToken } from '../functions/loginFunctions.js';
import { getUserData, upsertSpotifyUser } from '../functions/userFunctions.js';
// import User from '../models/User.js';

const router = express.Router();

router.get('/login', (req, res) => {
  // const scope = 'user-read-private user-read-email';
  const scope =
    'playlist-read-private playlist-read-collaborative user-top-read user-library-read';

  const redirect_uri =
    process.env.NODE_ENV === 'production'
      ? process.env.REDIRECT_URI_PROD
      : process.env.REDIRECT_URI_DEV;

  // Build query string using URLSearchParams (modern alternative to querystring)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.CLIENT_ID,
    scope: scope,
    redirect_uri: redirect_uri,
  });

  // Final Spotify authorization URL
  const authUrl = 'https://accounts.spotify.com/authorize?' + params.toString();

  // Redirect the user to Spotify's login/authorization page
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  // Get the authorization code sent by Spotify in the query string
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code missing');
  }
  try {
    // Exchange the authorization code for access and refresh tokens
    // The function handles both production and development redirect URIs
    const userTokens = await exchangeCodeForToken(
      code,
      process.env.NODE_ENV === 'production'
    );

    // Log the tokens (access_token, refresh_token, expires_in) for debugging
    console.log('Spotify user tokens:', userTokens);

    const userData = await getUserData(userTokens.access_token);
    const userDoc = {
      // token_created_timestamp: Date.now(),
      access_token: userTokens.access_token,
      refresh_token: userTokens.refresh_token,
      token_expires_in: userTokens.expires_in,
      // user_created_timestamp: Date.now(),
      display_name: userData.display_name,
      followers: userData.followers?.total || 0,
      spotify_user_id: userData.id,
    };

    try {
      await upsertSpotifyUser(userDoc);
    } catch (err) {
      console.error('Error saving user:', err);
      return res.status(500).send('Failed to save user');
    }

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.BASE_URL_PROD
        : process.env.BASE_URL_DEV;

    res.redirect(`${baseUrl}/`);
  } catch (error) {
    // Catch and log any errors during the token exchange
    console.error(error);
    res.status(500).send(error.message);
  }
});
export default router;
