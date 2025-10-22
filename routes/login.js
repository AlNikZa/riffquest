import express from 'express';
import {
  buildSpotifyAuthUrl,
  exchangeCodeForToken,
  getReturnToCookie,
} from '../functions/loginFunctions.js';
import {
  getUserData,
  upsertSpotifyUser,
  getUserDocObject,
} from '../functions/userFunctions.js';
import { scheduleUserTokenRefresh } from '../functions/userTokenFunctions.js';
// import User from '../models/User.js';

const router = express.Router();

router.get('/login', (req, res) => {
  const authUrl = buildSpotifyAuthUrl();
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

    const userData = await getUserData(userTokens.access_token);
    const userDoc = getUserDocObject(userTokens, userData);

    try {
      await upsertSpotifyUser(userDoc);
      scheduleUserTokenRefresh(userDoc.spotify_user_id, userDoc.refresh_token);
    } catch (err) {
      console.error('Error saving user:', err);
      return res.status(500).send('Failed to save user');
    }

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.BASE_URL_PROD
        : process.env.BASE_URL_DEV;

    req.session.spotify_user_id = userDoc.spotify_user_id;
    req.session.username = userDoc.display_name;
    req.session.userImg = userDoc.profileImg;
    req.session.justLoggedIn = true;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.clearCookie('returnTo', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      res.redirect(
        getReturnToCookie(req) || req.get('Referer') || baseUrl || '/'
      );
    });
  } catch (error) {
    // Catch and log any errors during the token exchange
    console.error(error);
    res.status(500).send(error.message);
  }
});

router.post('/reset-login-flag', (req, res) => {
  req.session.justLoggedIn = false;
});

export default router;
