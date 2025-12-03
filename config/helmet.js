/**
 * Helmet configuration for RiffQuest.
 *
 * Helmet helps secure Express apps by setting various HTTP headers.
 * The most important part here is the Content Security Policy (CSP),
 * which defines what sources of content (scripts, styles, images, etc.)
 * the browser is allowed to load. This helps prevent XSS, data injection,
 * and other browser-based attacks.
 */

import helmet from 'helmet';
import crypto from 'crypto';

export const helmetConfig = (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  helmet({
    contentSecurityPolicy: {
      directives: {
        // Allow same-origin requests by default
        defaultSrc: ["'self'"],

        // Scripts: own domain, inline scripts (for EJS templates), Bootstrap JS CDN
        scriptSrc: [
          "'self'",
          `'nonce-${nonce}'`, // Allow inline scripts with this nonce
          'https://cdn.jsdelivr.net', // Bootstrap JS CDN
        ],

        // Styles: own domain, inline styles, Bootstrap CSS, Google Fonts
        styleSrc: [
          "'self'",
          `'nonce-${nonce}'`, // inline style nonce
          'https://cdn.jsdelivr.net', // Bootstrap CSS CDN
          'https://fonts.googleapis.com', // Google Fonts CSS
        ],

        // Fonts: own domain, Bootstrap CDN, Google Fonts
        fontSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://fonts.gstatic.com', // Google Fonts font files
        ],

        // Images: own domain, base64 images, Spotify images
        imgSrc: [
          "'self'",
          'data:',
          'https://i.scdn.co', // Spotify images
        ],

        // Frames / iframes: Spotify embeds
        frameSrc: ["'self'", 'https://open.spotify.com'],

        // AJAX / fetch / WebSocket connections: own domain, CDN, Spotify API
        connectSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://api.spotify.com', // Spotify API calls
        ],
      },
    },
  })(req, res, next);
};

/**
 * Later improvements for production could include:
 * - Adding a CSP reporting endpoint (`report-to` / `report-uri`) to monitor policy violations.
 * - Extending `frameSrc` or `connectSrc` if new external APIs or iframes are added.
 * - Optionally, centralizing nonce generation and CSP configuration for easier maintenance.
 * - Considering additional security HTTP headers that Helmet provides (e.g., `Referrer-Policy`, `Permissions-Policy`).
 */
