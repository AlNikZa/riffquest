// config/helmet.js

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
        // default-src: Fallback for all other fetch directives.
        // 'self' restricts content to the same origin as the application.
        defaultSrc: ["'self'"],

        // script-src: Specifies valid sources for JavaScript.
        // - 'self': Fallback for older browsers; ignored by modern browsers when 'strict-dynamic' is supported.
        // - nonce: Allows specific inline <script> tags that match the generated nonce.
        // - 'strict-dynamic': Allows scripts loaded by trusted scripts (with nonce) to load other scripts.
        // - jsdelivr: Explicitly allows the Bootstrap JS CDN.
        scriptSrc: [
          "'self'",
          `'nonce-${nonce}'`,
          "'strict-dynamic'",
          'https://cdn.jsdelivr.net',
        ],

        // frame-ancestors: Restricts which origins can embed this site in an iframe.
        frameAncestors: ["'self'"],

        // style-src: Specifies valid sources for CSS stylesheets.
        // - 'self': Own stylesheets (e.g., custom.css).
        // - nonce: Inline styles with matching nonce.
        // - jsdelivr: Bootstrap CSS CDN.
        // - googleapis: External Google Fonts CSS.
        styleSrc: [
          "'self'",
          `'nonce-${nonce}'`,
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
        ],

        // font-src: Specifies valid sources for web fonts.
        // - fonts.gstatic.com: Actual font files served by Google.
        fontSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://fonts.gstatic.com',
        ],

        // img-src: Specifies valid sources for images.
        // - data:: Allows Base64 encoded images (often used for icons).
        // - *.musicbrainz.org: Enable for MusicBrainz covers
        // - lastfm.freetls.fastly.net: Enable for Last.fm image CDN
        // - *.last.fm: Enable for Last.fm fallback domains
        imgSrc: [
          "'self'",
          'data:',
          // 'https://*.musicbrainz.org',
          // 'https://lastfm.freetls.fastly.net',
          // 'https://*.last.fm',
        ],

        // frame-src: Specifies valid sources for nested browsing contexts (iframes).
        frameSrc: ["'self'"],

        // connect-src: Limits the origins to which you can send AJAX requests (Fetch/XHR).
        connectSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          // 'https://musicbrainz.org',
          // 'https://ws.audioscrobbler.com',
        ],
        // object-src: Disables plugins like Flash, Java, or Silverlight to reduce attack surface.
        objectSrc: ["'none'"],
        // base-uri: Restricts the URLs which can be used in a document's <base> element.
        // This prevents 'Base Tag Hijacking' where an attacker redirects relative links.
        baseUri: ["'self'"],
        // upgrade-insecure-requests: Instructs browsers to treat all HTTP URLs as HTTPS.
        // Essential for production environments on platforms like Render.
        upgradeInsecureRequests: [],
      },
    },
    // Permissions-Policy: Restricts use of browser features/APIs.
    // Setting these to 'none' ensures that even if an XSS occurs, the attacker
    // cannot access hardware like the camera or microphone.
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
      },
    },
    // Referrer-Policy: Controls how much referrer information is included with requests.
    // 'strict-origin-when-cross-origin' protects user privacy by only sending the domain,
    // not the full URL path, when moving from your site to another.
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // x-xss-protection: Legacy header for older browsers to stop pages from loading when
    // reflected XSS attacks are detected.
    xssFilter: true,
    // x-content-type-options: Prevents 'MIME-type sniffing', forcing the browser to
    // respect the Content-Type header sent by the server.
    noSniff: true,
  })(req, res, next);
};

/**
 * Later improvements for production could include:
 * - Adding a CSP reporting endpoint (`report-to` / `report-uri`) to monitor policy violations.
 * - Extending `frameSrc` or `connectSrc` if new external APIs or iframes are added.
 * - Optionally, centralizing nonce generation and CSP configuration for easier maintenance.
 */
