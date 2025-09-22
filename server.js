// Import token-related functions
import {
  initToken,
  getTokenOrRenderLoadingPage,
} from './functions/tokenFunctions.js';

// Import artist-related functions
import {
  getArtistId,
  getArtistTopTracks,
  getArtistAlbums,
  getArtistInfo,
} from './functions/artistFunctions.js';

import express from 'express';
const app = express();

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up views folder and view engine (EJS)
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Initialize Spotify API token (async)
await initToken();

/* ------------------------------------------------------------- */
/* ---------------------- Home Page Route ---------------------- */
/* ------------------------------------------------------------- */
app.get('/', (req, res) => {
  // Get the Spotify API token; if not ready, render loading page
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;

  // Render the home page with a title
  res.render('index', { title: 'RiffQuest' });
});

/* ----------------------------------------------------------- */
/* ---------------- Artist Top Tracks Route ------------------ */
/* ----------------------------------------------------------- */
app.get('/artistTopTracks', async (req, res) => {
  // Ensure token is available, otherwise render loading page
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;

  // Get artist name from query parameter
  const artist = req.query.artist;

  // Get artist ID from Spotify API
  const artistId = await getArtistId(artist, token);
  if (!artistId)
    return res.render('noResultsFound', { artist, title: 'Artist not found' });

  // Fetch top tracks for the artist
  const topTracks = await getArtistTopTracks(artistId, token);
  if (!topTracks || topTracks.length === 0)
    return res.render('noResultsFound', { artist, title: 'No tracks found' });

  // Render the top tracks page with dynamic title
  res.render('artistTopTracks', {
    topTracks,
    title: `The Best Of ${topTracks[0].artist}`,
  });
});

/* ----------------------------------------------------------- */
/* ------------------- Artist Albums Route ------------------- */
/* ----------------------------------------------------------- */
app.get('/artistAlbums', async (req, res) => {
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;

  const artist = req.query.artist;

  // Get artist ID from Spotify API
  const artistId = await getArtistId(artist, token);
  if (!artistId)
    return res.render('noResultsFound', { artist, title: 'Artist not found' });

  // Fetch all albums for the artist
  const albums = await getArtistAlbums(artistId, token);
  if (!albums || albums.length === 0)
    return res.render('noResultsFound', { artist, title: 'No albums found' });

  // Render the albums page with dynamic title
  res.render('artistAlbums', {
    albums,
    title: `All albums of ${albums[0].artist}`,
  });
});

/* ---------------------------------------------------------- */
/* ------------------- Show Artist Route -------------------- */
/* ---------------------------------------------------------- */
app.get('/showArtist', async (req, res) => {
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;

  const artist = req.query.artist;

  // Get artist ID from Spotify API
  const artistId = await getArtistId(artist, token);
  if (!artistId)
    return res.render('noResultsFound', { artist, title: 'Artist not found' });

  // Fetch full artist information
  const artistData = await getArtistInfo(artistId, token);

  if (!artistData)
    return res.render('noResultsFound', { artist, title: 'No artist found' });

  // Render the artist profile page with dynamic title
  res.render('artistInfo', {
    artistData,
    title: `${artistData.name} - Artist Profile`,
  });
});

/* -------------------------------------------------------- */
/* ------------------- Artist Redirect -------------------- */
/* -------------------------------------------------------- */

app.get('/artistRedirect', (req, res) => {
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

// 404 handler
// This middleware is executed if no route above matches the request
app.use((req, res, next) => {
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
app.use((err, req, res, next) => {
  // Log the full error stack for debugging purposes
  console.error('Global error handler:', err.stack);

  // Extract optional query parameters from the request
  const { artist, track, album } = req.query; // or req.params for dynamic routes

  // Render the error page with error details and optional context
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message || 'Internal server error',
    artist: artist || null,
    track: track || null,
    album: album || null,
    status: err.status || 500, // optionally pass the status code to the view
  });
});

/* ---------------------------------------------------------- */
/* ------------------- Start Server ------------------------- */
/* ---------------------------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
