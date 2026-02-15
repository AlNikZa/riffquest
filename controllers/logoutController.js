// controllers/logoutController.js

import { config } from '../config/env.js';

import { removeTokensForUser } from '../services/userTokenService.js';
import { getReturnToCookie } from '../services/loginService.js';
import { AppError } from '../AppError.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const logoutController = catchAsync(async (req, res, next) => {
  if (!req.session?.spotify_user_id) {
    return res.status(302).redirect('/');
  }

  //  Remove the user's Spotify tokens from the database
  await removeTokensForUser(req.session.spotify_user_id).catch((err) => {
    console.error('❌ Error removing user tokens during logout:', err.message);
  });

  //   Destroy the Express session
  req.session.destroy((err) => {
    if (err) {
      // Manual next(err) is required here because catchAsync doesn't capture errors inside nested callbacks.
      return next(new AppError('Error destroying session', 500));
    } else {
      //   Clear the session cookie from the browser
      res.clearCookie('riffQuestSessionId', {
        path: '/',
        secure: config.isProd,
        sameSite: config.isProd ? 'none' : 'lax',
        httpOnly: true,
      });

      //   Redirect the user to the current or homepage after logout
      const returnTo = getReturnToCookie(req);
      res.status(302).redirect(returnTo || req.get('Referer') || '/');
    }
  });
});
