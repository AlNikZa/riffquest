// controllers/logoutController.js

import { config } from '../config/env.js';

import { removeTokensForUser } from '../services/userTokenService.js';
import { getSafeRedirect } from '../services/loginService.js';

import {
  createAuthError,
  createLogOnlyAuthError,
} from '../mappers/errorRegistry/authErrors.js';
import { logError } from '../utils/errorHelpers.js';

import { catchAsync } from '../utils/catchAsync.js';

export const logoutController = catchAsync(async (req, res, next) => {
  if (!req.session?.spotify_user_id) {
    return res.status(302).redirect('/');
  }

  //  Remove the user's Spotify tokens from the database
  try {
    await removeTokensForUser(req.session.spotify_user_id);
  } catch (err) {
    const error = createLogOnlyAuthError('userTokenRemovingError', {
      cause: err,
      userId: req.session.spotify_user_id,
    });
    logError(error);
  }

  //   Destroy the Express session
  req.session.destroy((err) => {
    if (err) {
      // Manual next(err) is required here because catchAsync doesn't capture errors inside nested callbacks.
      return next(createAuthError('logoutFailed', { cause: err }));
    } else {
      //   Clear the session cookie from the browser
      res.clearCookie('riffQuestSessionId', {
        path: '/',
        secure: config.isProd,
        sameSite: config.isProd ? 'none' : 'lax',
        httpOnly: true,
      });

      //   Redirect the user to the currenreq);
      const safeRedirectUrl = getSafeRedirect(req);
      res.status(302).redirect(safeRedirectUrl);
    }
  });
});
