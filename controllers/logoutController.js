// controllers/logoutController.js

import { config } from '../config/env.js';

import { removeTokensForUser } from '../services/userTokenService.js';
import { getReturnToCookie } from '../services/loginService.js';
import { AppError } from '../AppError.js';

export const logoutController = async (req, res, next) => {
  if (!req.session?.spotify_user_id) {
    return res.status(302).redirect('/');
  }

  //  Remove the user's Spotify tokens from the database
  try {
    await removeTokensForUser(req.session.spotify_user_id);
  } catch (error) {
    // Log the  error but proceed to destroy the session to ensure secure client logout.
    console.error('❌ Error removing user tokens during logout.');
  }

  //   Destroy the Express session
  req.session.destroy((err) => {
    if (err) {
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
};
