// config/rateLimit.js

// -------------------------------------------------------------
// Rate Limiting Configuration
// - Defines middleware to limit repeated requests
// - Helps prevent brute-force attacks and abuse
// -------------------------------------------------------------

import rateLimit from 'express-rate-limit';

function renderRateLimitError(req, res, title, message) {
  const isLoggedIn = !!req.session?.spotify_user_id;

  res.status(429);
  res.render('error', {
    statusCode: 429,
    title,
    message,
    isLoggedIn,
    username: req.session?.username || null,
    userImg: req.session?.userImg || null,
    artist: null,
    track: null,
    album: null,
    nonce: res.locals.nonce || null,
    csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : null,
  });
}

// General limiter: applies to all requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res, next) => {
    renderRateLimitError(
      req,
      res,
      'Too Many Requests',
      '⏳ You have reached the request limit. Please wait a few minutes and try again.'
    );
  },
});

// Login-specific limiter: stricter limit for login attempts
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 login attempts per IP
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res, next) => {
    renderRateLimitError(
      req,
      res,
      'Login Rate Limit Exceeded',
      '🚫 You have made too many login attempts. Please wait a few minutes and try again.'
    );
  },
});

export const devLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 10, // max 10 requests per IP
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res, next) => {
    renderRateLimitError(
      req,
      res,
      'Development Rate Limit Exceeded',
      '🚫 You have made too many requests to the development endpoints. Please wait a while and try again.'
    );
  },
});
