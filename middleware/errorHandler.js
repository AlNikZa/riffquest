// middleware/errorHandler.js

import { config } from '../config/env.js';

import { AppError } from '../AppError.js';
import { removeTokensForUser } from '../services/userTokenService.js';

// Wrap async route handlers to automatically catch errors
// and forward them to globalErrorHandler
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const getViewContext = (req, res, err) => {
  let csrf;
  try {
    csrf = typeof req.csrfToken === 'function' ? req.csrfToken() : null;
  } catch (e) {
    csrf = null;
  }
  return {
    isLoggedIn: !!req.session && req.session.spotify_user_id,
    username: req.session ? req.session.username : null,
    userImg: req.session ? req.session.userImg : null,
    artist: req.query.artist || null,
    album: req.query.album || null,
    track: req.query.track || null,
    csrfToken: csrf,
    nonce: res.locals.nonce || req.nonce || null,
    errors: err.errors || null,
  };
};

// 404 handler
// This middleware is executed if no route above matches the request
export const notFoundHandler = (req, res, next) => {
  next(new AppError('We couldn’t find the page you’re looking for.', 404));
};

// Global error handler
// This middleware will catch errors thrown in async routes or anywhere else
export const globalErrorHandler = async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;

  console.error(
    `❌ ${err.status || 'error'}: ${err.statusCode} Global error handler: ${
      err.message
    }`,
  );

  if (!config.isProd) {
    console.error(err.stack);
  }

  if (err.errors && Array.isArray(err.errors)) {
    err.errors.forEach((e, index) => {
      if (err.errors.length > 1) console.error(`--- Error #${index + 1} ---`);
      Object.entries(e).forEach(([key, value]) => {
        console.error(`${key}: ${value}`);
      });
      if (err.errors.length > 1) console.error(`---------------`);
    });
  }

  if (err.logOnly) {
    return next();
  }

  // Handle 401 errors by removing tokens and destroying session
  if (err.statusCode === 401 && err.isOperational) {
    try {
      const userId = req.session?.spotify_user_id;

      if (userId) await removeTokensForUser(userId);

      if (req.session) {
        await new Promise((resolve) => {
          req.session.destroy(() => {
            res.clearCookie('riffQuestSessionId', {
              path: '/',
              secure: config.isProd,
              sameSite: config.isProd ? 'none' : 'lax',
              httpOnly: true,
            });
            resolve();
          });
        });
      }

      return res.status(401).render('error', {
        title: 'Session Expired',
        message:
          'Your Spotify session has expired. Please log in again to continue.',
        statusCode: 401,
        ...getViewContext(req, res, err),
      });
    } catch (error) {
      return res.status(500).render('error', {
        title: 'Error',
        message:
          'An error occurred while processing your request. Please refresh the page or try again later.',
        statusCode: 500,
        ...getViewContext(req, res, err),
      });
    }
  }

  // If it is 404 → render noResultsFound.ejs
  if (err.statusCode === 404) {
    return res.status(404).render('noResultsFound', {
      title: 'Nothing found',
      message: err.message || 'Page Not Found.',
      ...getViewContext(req, res, err),
    });
  }

  // Render the error page with error details and optional context
  res.status(err.statusCode).render('error', {
    title: 'Error',
    message: err.isOperational ? err.message : 'Something went wrong',
    statusCode: err.statusCode,
    ...getViewContext(req, res, err),
  });
};
