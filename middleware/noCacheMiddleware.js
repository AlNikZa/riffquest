// middleware/noCacheMiddleware.js

export const noCacheMiddleware = (req, res, next) => {
  // Regex pattern to match static file extensions (images, CSS, JS, fonts, sourcemaps)
  const staticFileRegex =
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|map)$/i;

  if (staticFileRegex.test(req.originalUrl)) {
    // If the request is for a static file, skip setting no-cache headers
    return next();
  }

  // For all other requests (dynamic pages, API routes, etc.), set headers to prevent caching
  res.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  next();
};
