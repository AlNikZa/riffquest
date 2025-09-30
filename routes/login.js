import express from 'express';
import { exchangeCodeForToken } from '../functions/loginFunctions.js';
const router = express.Router();

router.get('/login', (req, res) => {
  // const scope = 'user-read-private user-read-email';
  const scope =
    'playlist-read-private playlist-read-collaborative user-top-read user-library-read';

  const redirect_uri =
    process.env.NODE_ENV === 'production'
      ? 'https://riffquest.onrender.com/callback'
      : 'http://127.0.0.1:3000/callback';

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

  try {
    // Exchange the authorization code for access and refresh tokens
    // The function handles both production and development redirect URIs
    const tokens = await exchangeCodeForToken(
      code,
      process.env.NODE_ENV === 'production'
    );

    // Log the tokens (access_token, refresh_token, expires_in) for debugging
    console.log('Spotify tokens:', tokens);

    // You can store these tokens in a session, database, or send them to the frontend
    res.send('Spotify login successful! You can now use your token.');
  } catch (error) {
    // Catch and log any errors during the token exchange
    console.error(error);
    res.status(500).send(error.message);
  }
});
export default router;
