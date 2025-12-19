// routes/artist.js

import express from 'express';

import {
  artistQueryValidator,
  autocompleteBodyValidator,
  redirectQueryValidator,
} from '../validators/searchValidator.js';
import { handleValidationErrors } from '../middleware/validationHandler.js';
import { checkCsrfToken } from '../middleware/csrf.js';
import { getTokenAndArtistIdMiddleware } from '../middleware/artistMiddleware.js';
import {
  artistTopTracksController,
  artistAlbumsController,
  artistProfileController,
  artistRedirectController,
  artistAutocompleteController,
} from '../controllers/artistController.js';

const router = express.Router();

/* ----------------------------------------------------------- */
/* ---------------- Artist Top Tracks Route ------------------ */
/* ----------------------------------------------------------- */
router.get(
  '/artists/top-tracks',
  artistQueryValidator,
  handleValidationErrors,
  getTokenAndArtistIdMiddleware,
  artistTopTracksController
);

/* ----------------------------------------------------------- */
/* ------------------- Artist Albums Route ------------------- */
/* ----------------------------------------------------------- */
router.get(
  '/artists/albums',
  artistQueryValidator,
  handleValidationErrors,
  getTokenAndArtistIdMiddleware,
  artistAlbumsController
);

/* ---------------------------------------------------------- */
/* ------------------- Show Artist Route -------------------- */
/* ---------------------------------------------------------- */
router.get(
  '/artists/profile',
  artistQueryValidator,
  handleValidationErrors,
  getTokenAndArtistIdMiddleware,
  artistProfileController
);

/* -------------------------------------------------------- */
/* ------------------- Artist Redirect -------------------- */
/* -------------------------------------------------------- */
router.get(
  '/artists/redirect',
  redirectQueryValidator,
  handleValidationErrors,
  artistRedirectController
);
/* -------------------------------------------------------------------- */
/* ------------------- Artist Input Suggestions -------------------- */
/* -------------------------------------------------------------------- */
router.post(
  '/artists/autocomplete',
  checkCsrfToken,
  autocompleteBodyValidator,
  handleValidationErrors,
  artistAutocompleteController
);

export default router;
