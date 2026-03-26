// middleware/noCacheMiddleware.js

import { AppError } from '../utils/AppError.js';

export const noCacheMiddleware = (req, res, next) => {
  try {
    if (res.headersSent) {
      return next();
    }

    const url = req.originalUrl || req.url || '';

    // Regex pattern to match static file extensions (images, CSS, JS, fonts, sourcemaps)
    const staticFileRegex =
      /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|map)$/i;

    if (staticFileRegex.test(url)) {
      // If the request is for a static file, skip setting no-cache headers
      return next();
    }

    // For all other requests (dynamic pages, API routes, etc.), set headers to prevent caching
    if (typeof res.set === 'function') {
      res.set({
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Surrogate-Control': 'no-store',
      });
    }
    next();
  } catch (error) {
    const msg =
      error?.message ||
      (typeof error === 'string' ? error : 'Internal Cache Middleware Error');
    console.error(`❌ NoCacheMiddleware Error: ${msg}`);
    next();
  }
};
