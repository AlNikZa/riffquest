// controllers/loginController.js

import { config } from '../config/env.js';

import {
  buildOAuthUrl,
  exchangeCodeForToken,
  getSafeRedirect,
} from '../services/loginService.js';
import {
  getUserData,
  upsertUser,
  getUserDocObject,
} from '../services/userService.js';

import { createAuthError } from '../mappers/errorRegistry/authErrors.js';

import { catchAsync } from '../utils/catchAsync.js';

export const loginController = (req, res, next) => {
  try {
    const authUrl = buildOAuthUrl(req);
    // Redirect the user to Spotify's login/authorization page
    res.status(302).redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

export const loginCallbackController = catchAsync(async (req, res, next) => {
  // Extract authorization code and error from Spotify's redirect query parameters
  const { code, error, state } = req.query;

  const safeRedirectUrl = getSafeRedirect(req);

  // 1. Handle user cancellation
  if (error === 'access_denied') {
    return res.status(302).redirect(safeRedirectUrl);
  }

  // 2. Security Check: Validate state parameter

  const expectedState = req.session.oauthState;
  // Cleanup sensitive state
  delete req.session.oauthState;

  if (!state || !expectedState || state !== expectedState) {
    throw createAuthError('oauthStateMismatch', {
      received: state,
      expected: expectedState,
    });
  }

  if (!code) {
    throw createAuthError('tokenExchangeFailed', {
      query: req.query,
    });
    // return res.status(302).redirect(safeRedirectUrl);  // consider this
  }

  // 3. Exchange the authorization code for access and refresh tokens
  const userTokens = await exchangeCodeForToken(code);

  // 4. Get user profile from Spotify
  const userData = await getUserData(userTokens.access_token);

  // 5. Prepare document for database
  const userDoc = getUserDocObject(userTokens, userData);

  // 6. Persist user and tokens to MongoDB
  await upsertUser(userDoc);

  // 7. Establish application session

  // CONSIDER: Regenerating the session after successful login to issue a new session ID.
  // This would mitigate potential session fixation attacks.
  // User data should then be set within the regenerate callback before saving the session.

  req.session.spotify_user_id = userDoc.spotify_user_id;
  req.session.username = userDoc.display_name;
  req.session.userImg = userDoc.profile_img;
  req.session.justLoggedIn = true;

  // 8. Finalize session and redirect
  req.session.save((err) => {
    if (err) {
      // Manual next(err) is required as catchAsync cannot capture errors inside nested callbacks.
      // This raw error will be intercepted and wrapped in a System AppError by the globalErrorHandler.
      return next(err);
    }
    res.clearCookie('returnTo', {
      path: '/',
      secure: config.isProd,
      sameSite: config.isProd ? 'none' : 'lax',
    });

    res.status(302).redirect(safeRedirectUrl);
  });
});

export const resetLoginFlagController = (req, res) => {
  req.session.justLoggedIn = false;
  res.sendStatus(204);
};
