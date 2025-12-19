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
import { decrypt } from '../services/cryptoService.js';
import { scheduleUserTokenRefresh } from '../services/userTokenService.js';

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

  // If user canceled Spotify login, redirect back to previous page or home
  if (error === 'access_denied') {
    return res
      .status(302)
      .redirect(getReturnToCookie(req) || req.get('Referer') || baseUrl || '/');
  }

  // Validate state parameter (protects against OAuth CSRF)
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
    // Exchange the authorization code for access and refresh tokens
    // The function handles both production and development redirect URIs
    const userTokens = await exchangeCodeForToken(
      code,
      process.env.NODE_ENV === 'production'
    );

    const userData = await getUserData(userTokens.access_token);

    const userDoc = getUserDocObject(userTokens, userData);

    try {
      await upsertSpotifyUser(userDoc);
      scheduleUserTokenRefresh(
        userDoc.spotify_user_id,
        decrypt(userDoc.refresh_token)
      );
    } catch (err) {
      return next(err);
    }

    req.session.spotify_user_id = userDoc.spotify_user_id;
    req.session.username = userDoc.display_name;
    req.session.userImg = userDoc.profileImg;
    req.session.justLoggedIn = true;

    delete req.session.oauthState;

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
