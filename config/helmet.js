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

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      // Allow same-origin requests by default
      defaultSrc: ["'self'"],

      // Scripts: own domain, inline scripts (for EJS templates), Bootstrap JS CDN
      scriptSrc: [
        "'self'",
        //  "'unsafe-inline'": temporarily allows inline <script> tags (needed for EJS templates or Bootstrap JS snippets).
        //   ⚠️ Note: This weakens CSP and should be replaced with a nonce system in production for stronger XSS protection.
        "'unsafe-inline'", // Required for inline <script> blocks
        'https://cdn.jsdelivr.net', // Bootstrap JS CDN
      ],

      // Styles: own domain, inline styles, Bootstrap CSS, Google Fonts
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Needed for inline styles in EJS templates
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
});

/**
 * Later improvements for production could include:
 * - Removing 'unsafe-inline' and replacing it with a dynamic nonce system.
 * - Adding a CSP reporting endpoint (report-to / report-uri) to log policy violations.
 * - Extending frameSrc or connectSrc if more external APIs are used.
 */
