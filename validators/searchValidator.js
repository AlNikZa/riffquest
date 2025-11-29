import { query, body } from 'express-validator';

/* ----------------------------------------------------------- */
/* ----------------- Artist Query Validator ----------------- */
/* ----------------------------------------------------------- */
export const artistQueryValidator = [
  query('artist')
    .trim()
    .notEmpty()
    .withMessage('Artist name is required.')
    .isLength({ min: 1, max: 80 })
    .withMessage('Artist name must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-.,!?'"()&:/+]+$/u)
    .withMessage('Artist name contains invalid characters.'),
];

/* ----------------------------------------------------------- */
/* ----------------- Album Query Validator ------------------ */
/* ----------------------------------------------------------- */
export const albumQueryValidator = [
  query('album')
    .trim()
    .notEmpty()
    .withMessage('Album name is required.')
    .isLength({ min: 1, max: 80 })
    .withMessage('Album name must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-,.!?'"()]+$/u)
    .withMessage('Album name contains invalid characters.'),
];

/* ----------------------------------------------------------- */
/* ----------------- Track Query Validator ------------------ */
/* ----------------------------------------------------------- */
export const trackQueryValidator = [
  query('track')
    .trim()
    .notEmpty()
    .withMessage('Track name is required.')
    .isLength({ min: 1, max: 80 })
    .withMessage('Track name must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-,.!?'"()]+$/u)
    .withMessage('Track name contains invalid characters.'),
];

/* ----------------------------------------------------------- */
/* ---------------- Autocomplete Validator ------------------ */
/* ----------------------------------------------------------- */
// Validates the request body for POST /artists/autocomplete
export const autocompleteBodyValidator = [
  body('query')
    .trim() // remove leading/trailing whitespace
    .notEmpty()
    .withMessage('Search query is required.')
    .isLength({ min: 1, max: 80 })
    .withMessage('Search query must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-,.!?'"()]+$/u)
    .withMessage('Search query contains invalid characters.'),
];

/* ----------------------------------------------------------- */
/* ---------------- Redirect Validator ---------------------- */
/* ----------------------------------------------------------- */
// Validates query parameters for /redirect route
// Can handle artist, album, and track, plus an optional 'option' param
export const redirectQueryValidator = [
  query('artist')
    .optional() // artist param is optional
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Artist name must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-,.!?'"()]+$/u)

    .withMessage('Artist name contains invalid characters.'),

  query('album')
    .optional() // album param is optional
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Album name must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-,.!?'"()]+$/u)

    .withMessage('Album name contains invalid characters.'),

  query('track')
    .optional() // track param is optional
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Track name must be 1–80 characters long.')
    .matches(/^[\p{L}\d\s\-,.!?'"()]+$/u)

    .withMessage('Track name contains invalid characters.'),

  // Custom validator to ensure at least one of artist, album, or track is present
  (req, res, next) => {
    if (!req.query.artist && !req.query.album && !req.query.track) {
      return res.status(400).render('error', {
        message: 'At least one of artist, album or track must be provided.',
      });
    }
    next();
  },

  query('option')
    .isIn(['allAlbums', 'topTracks', 'details'])
    .withMessage('Invalid redirect option.'),
];
