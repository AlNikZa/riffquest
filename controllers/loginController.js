// controllers/loginController.js

import {
  buildSpotifyAuthUrl,
  exchangeCodeForToken,
  getReturnToCookie,
} from '../services/loginService.js';
import {
  getUserData,
  upsertSpotifyUser,
  getUserDocObject,
} from '../services/userService.js';
// import { decrypt } from '../services/cryptoService.js';
// import { scheduleUserTokenRefresh } from '../services/userTokenService.js';

import { AppError } from '../middleware/errorHandler.js';

export const loginController = (req, res, next) => {
  try {
    const authUrl = buildSpotifyAuthUrl(req);
    // Redirect the user to Spotify's login/authorization page
    res.status(302).redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

export const loginCallbackController = async (req, res, next) => {
  // Extract authorization code and error from Spotify's redirect query parameters
  const { code, error, state } = req.query;

  // Determine base URL based on environment (production or development)
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.BASE_URL_PROD
      : process.env.BASE_URL_DEV;

  // 1. Handle user cancellation
  if (error === 'access_denied') {
    return res
      .status(302)
      .redirect(getReturnToCookie(req) || req.get('Referer') || baseUrl || '/');
  }

  // 2. Security Check: Validate state parameter
  if (!state || state !== req.session.oauthState) {
    return next(
      new AppError('Invalid OAuth state. Please try logging in again.', 403)
    );
  }

  if (!code) {
    return res
      .status(302)
      .redirect(getReturnToCookie(req) || req.get('Referer') || baseUrl || '/');
  }

  try {
    // 3. Exchange the authorization code for access and refresh tokens
    // The function handles both production and development redirect URIs
    const userTokens = await exchangeCodeForToken(
      code,
      process.env.NODE_ENV === 'production'
    );

    // 4. Get user profile from Spotify
    const userData = await getUserData(userTokens.access_token);

    // 5. Prepare document for database
    const userDoc = getUserDocObject(userTokens, userData);

    // 6. Persist user and tokens to MongoDB
    await upsertSpotifyUser(userDoc);

    // 7. Establish application session
    req.session.spotify_user_id = userDoc.spotify_user_id;
    req.session.username = userDoc.display_name;
    req.session.userImg = userDoc.profileImg;
    req.session.justLoggedIn = true;

    // Cleanup sensitive state
    delete req.session.oauthState;

    // 8. Finalize session and redirect
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('returnTo', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      res
        .status(302)
        .redirect(
          getReturnToCookie(req) || req.get('Referer') || baseUrl || '/'
        );
    });
  } catch (error) {
    next(error);
  }
};

export const resetLoginFlagController = (req, res) => {
  req.session.justLoggedIn = false;
  res.sendStatus(200);
};
