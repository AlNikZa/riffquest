import express from 'express';
const router = express.Router();

// 404 handler
// This middleware is executed if no route above matches the request
router.use((req, res, next) => {
  console.error(
    '❌ 404 error handler: Requested URL not found ->',
    req.originalUrl
  );
  // Extract possible query parameters from the request
  // Example: /artistTopTracks?artist=Queen
  const { artist, track, album } = req.query; // or req.params for dynamic routes

  // Render a "not found" page and pass optional context
  // If artist/track/album were not provided, set them to null
  res.status(404).render('noResultsFound', {
    artist: artist || null,
    track: track || null,
    album: album || null,
    title: 'Nothing found',
  });
});

// Global error handler
// This middleware will catch errors thrown in async routes or anywhere else
router.use((err, req, res, next) => {
  // Log the full error stack for debugging purposes
  console.error('❌ Global error handler:', err.stack);

  // Extract optional query parameters from the request
  const { artist, track, album } = req.query; // or req.params for dynamic routes
  const isProd = process.env.NODE_ENV === 'production';

  // Render the error page with error details and optional context
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: isProd ? 'Something went wrong' : err.message,
    artist: artist || null,
    track: track || null,
    album: album || null,
    status: err.status || 500, // optionally pass the status code to the view
  });
});

export default router;
