import express from 'express';
import { getTokenOrRenderLoadingPage } from '../functions/tokenFunctions.js';
import {
  getArtistId,
  getArtistTopTracks,
  getArtistAlbums,
  getArtistInfo,
  getArtistsList,
} from '../functions/artistFunctions.js';

const router = express.Router();

/* ----------------------------------------------------------- */
/* ---------------- Artist Top Tracks Route ------------------ */
/* ----------------------------------------------------------- */
router.get('/artistTopTracks', async (req, res, next) => {
  try {
    // Ensure token is available, otherwise render loading page
    const token = getTokenOrRenderLoadingPage(res);
    if (!token) return;

    const artist = req.query.artist;

    // Get artist ID from Spotify API
    const artistId = await getArtistId(artist, token);
    if (!artistId) {
      return res.render('noResultsFound', {
        artist,
        title: 'Artist not found',
      });
    }

    // Fetch top tracks for the artist
    const topTracks = await getArtistTopTracks(artistId, token);
    if (!topTracks || topTracks.length === 0) {
      return res.render('noResultsFound', {
        artist: artist || 'Unknown Artist',
        title: 'No tracks found',
      });
    }

    // Render the top tracks page with dynamic title
    res.render('artistTopTracks', {
      topTracks,
      artist: topTracks[0]?.artist || artist || 'Unknown Artist',
      title: `The Best Of ${
        topTracks[0]?.artist || artist || 'Unknown Artist'
      }`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
});

/* ----------------------------------------------------------- */
/* ------------------- Artist Albums Route ------------------- */
/* ----------------------------------------------------------- */
router.get('/artistAlbums', async (req, res, next) => {
  try {
    // Ensure token is available, otherwise render loading page
    const token = getTokenOrRenderLoadingPage(res);
    if (!token) return;

    const artist = req.query.artist;

    // Get artist ID from Spotify API
    const artistId = await getArtistId(artist, token);
    if (!artistId) {
      return res.render('noResultsFound', {
        artist,
        title: 'Artist not found',
      });
    }

    // Fetch all albums for the artist
    const albums = await getArtistAlbums(artistId, token);
    if (!albums || albums.length === 0) {
      return res.render('noResultsFound', {
        artist,
        title: 'No albums found',
      });
    }

    // Render the albums page with dynamic title and artist info
    res.render('artistAlbums', {
      albums,
      artist: albums[0]?.artist || artist || 'Unknown Artist',
      title: `All albums of ${albums[0]?.artist || artist || 'Unknown Artist'}`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
});

/* ---------------------------------------------------------- */
/* ------------------- Show Artist Route -------------------- */
/* ---------------------------------------------------------- */
router.get('/showArtist', async (req, res, next) => {
  try {
    const token = getTokenOrRenderLoadingPage(res);
    if (!token) return;

    const artist = req.query.artist;

    // Get artist ID from Spotify API
    const artistId = await getArtistId(artist, token);
    if (!artistId) {
      return res.render('noResultsFound', {
        artist: artist || 'Unknown Artist',
        title: 'Artist not found',
      });
    }

    // Fetch full artist information
    const artistData = await getArtistInfo(artistId, token);
    if (!artistData) {
      return res.render('noResultsFound', { artist, title: 'No artist found' });
    }

    // Render the artist profile page with dynamic title
    res.render('artistInfo', {
      artistData,
      title: `${
        artistData?.name || artist || 'Unknown Artist'
      } - Artist Profile`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
});

/* -------------------------------------------------------- */
/* ------------------- Artist Redirect -------------------- */
/* -------------------------------------------------------- */
router.get('/artistRedirect', (req, res) => {
  const { artist, option } = req.query;

  if (!artist) {
    return res.render('noResultsFound', {
      artist: null,
      title: 'No artist entered',
    });
  }

  switch (option) {
    case 'allAlbums':
      return res.redirect(`/artistAlbums?artist=${encodeURIComponent(artist)}`);
    case 'topTracks':
      return res.redirect(
        `/artistTopTracks?artist=${encodeURIComponent(artist)}`
      );
    case 'details':
      return res.redirect(`/showArtist?artist=${encodeURIComponent(artist)}`);
    default:
      return res.redirect(`/artistAlbums?artist=${encodeURIComponent(artist)}`);
  }
});
/* -------------------------------------------------------------------- */
// /* ------------------- Artist Input Suggestions -------------------- */
/* -------------------------------------------------------------------- */
// ------------------- Autocomplete Route -------------------
router.post('/autocomplete', async (req, res, next) => {
  try {
    // Get Spotify access token (or render loading page if token is missing/expired)
    const token = await getTokenOrRenderLoadingPage(res);
    if (!token) return; // stop if no token is available

    // Read the search query from the request body
    const query = req.body.query;
    if (!query) return res.json([]); // return empty array if no query provided

    // Call helper function to fetch artist list from Spotify API
    const artistsList = await getArtistsList(query, token);

    // Send the array of artist names back to the frontend as JSON
    res.json(artistsList);
  } catch (err) {
    // Forward any errors to the global error handler
    next(err);
  }
});

export default router;
