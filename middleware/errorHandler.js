// appError class to create operational errors
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler
// This middleware is executed if no route above matches the request
export const notFoundHandler = (req, res, next) => {
  next(new AppError('Page Not Found.', 404));
};

// Global error handler
// This middleware will catch errors thrown in async routes or anywhere else
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  console.error(
    `❌ ${err.status}: ${err.statusCode} Global error handler: ${err.message}`
  );

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    console.error(err.stack);
  }

  // If it is 404 → render noResultsFound.ejs
  if (err.statusCode === 404) {
    return res.status(404).render('noResultsFound', {
      title: 'Nothing found',
      artist: req.query.artist || null,
      album: req.query.album || null,
      track: req.query.track || null,
      csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : null,
      nonce: res.locals.nonce || req.nonce || null,
      message: err.message || 'Page Not Found.',
    });
  }

  // Render the error page with error details and optional context
  res.status(err.statusCode).render('error', {
    title: 'Error',
    message: err.isOperational ? err.message : 'Something went wrong',
    status: err.statusCode || 500,
    artist: req.query.artist || null,
    album: req.query.album || null,
    track: req.query.track || null,
    csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : null,
    nonce: res.locals.nonce || req.nonce || null,
  });
};
