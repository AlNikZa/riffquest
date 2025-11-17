import express from 'express';
const router = express.Router();

import {
  artistTopTracksController,
  artistAlbumsController,
  artistProfileController,
  artistRedirectController,
  artistAutocompleteController,
} from '../controllers/artistController.js';

/* ----------------------------------------------------------- */
/* ---------------- Artist Top Tracks Route ------------------ */
/* ----------------------------------------------------------- */
router.get('/artists/top-tracks', artistTopTracksController);

/* ----------------------------------------------------------- */
/* ------------------- Artist Albums Route ------------------- */
/* ----------------------------------------------------------- */
router.get('/artists/albums', artistAlbumsController);

/* ---------------------------------------------------------- */
/* ------------------- Show Artist Route -------------------- */
/* ---------------------------------------------------------- */
router.get('/artists/profile', artistProfileController);

/* -------------------------------------------------------- */
/* ------------------- Artist Redirect -------------------- */
/* -------------------------------------------------------- */
router.get('/artists/redirect', artistRedirectController);
/* -------------------------------------------------------------------- */
/* ------------------- Artist Input Suggestions -------------------- */
/* -------------------------------------------------------------------- */
router.post('/artists/autocomplete', artistAutocompleteController);

export default router;
