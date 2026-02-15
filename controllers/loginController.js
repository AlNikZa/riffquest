// controllers/loginController.js

import { config } from '../config/env.js';

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

import { AppError } from '../AppError.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const loginController = (req, res, next) => {
  try {
    const authUrl = buildSpotifyAuthUrl(req);
    // Redirect the user to Spotify's login/authorization page
    res.status(302).redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

export const loginCallbackController = catchAsync(async (req, res, next) => {
  // Extract authorization code and error from Spotify's redirect query parameters
  const { code, error, state } = req.query;

  // 1. Handle user cancellation
  if (error === 'access_denied') {
    return res
      .status(302)
      .redirect(
        getReturnToCookie(req) ||
          req.get('Referer') ||
          config.appBaseUrl ||
          '/',
      );
  }

  // 2. Security Check: Validate state parameter
  if (!state || state !== req.session.oauthState) {
    throw new AppError(
      'Invalid OAuth state. Please try logging in again.',
      403,
    );
  }

  if (!code) {
    return res
      .status(302)
      .redirect(
        getReturnToCookie(req) ||
          req.get('Referer') ||
          config.appBaseUrl ||
          '/',
      );
  }

  // 3. Exchange the authorization code for access and refresh tokens
  const userTokens = await exchangeCodeForToken(code);

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
      // Manual next(err) is required here because catchAsync doesn't capture errors inside nested callbacks.
      return next(err);
    }
    res.clearCookie('returnTo', {
      path: '/',
      secure: config.isProd,
      sameSite: config.isProd ? 'none' : 'lax',
    });

    res
      .status(302)
      .redirect(
        getReturnToCookie(req) ||
          req.get('Referer') ||
          config.appBaseUrl ||
          '/',
      );
  });
});

export const resetLoginFlagController = (req, res) => {
  req.session.justLoggedIn = false;
  res.sendStatus(200);
};
