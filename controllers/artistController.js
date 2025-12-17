import { getTokenOrThrowNewAppError } from '../services/globalTokenService.js';
import {
  getArtistId,
  getArtistTopTracks,
  getArtistAlbums,
  getArtistInfo,
  getArtistsList,
} from '../services/artistService.js';

export const artistTopTracksController = async (req, res, next) => {
  try {
    const token = getTokenOrThrowNewAppError();

    const artist = req.query.artist;

    if (!artist) {
      return res
        .status(400)
        .render('noResultsFound', { title: 'Missing artist name' });
    }

    // Get artist ID from Spotify API
    const artistId = await getArtistId(artist, token);
    if (!artistId) {
      return res.status(404).render('noResultsFound', {
        artist: artist || 'Unknown Artist',
        title: 'Artist not found',
      });
    }

    // Fetch top tracks for the artist
    const topTracks = await getArtistTopTracks(artistId, token);
    if (!topTracks || topTracks.length === 0) {
      return res.status(404).render('noResultsFound', {
        artist: artist || 'Unknown Artist',
        title: 'No tracks found',
      });
    }

    // Render the top tracks page with dynamic title
    res.status(200).render('artistTopTracks', {
      topTracks,
      artist: topTracks[0]?.artist || artist || 'Unknown Artist',
      title: `The Best Of ${
        topTracks[0]?.artist || artist || 'Unknown Artist'
      }`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
};

export const artistAlbumsController = async (req, res, next) => {
  try {
    const token = getTokenOrThrowNewAppError();

    const artist = req.query.artist;

    if (!artist) {
      return res
        .status(400)
        .render('noResultsFound', { title: 'Missing artist name' });
    }

    // Get artist ID from Spotify API
    const artistId = await getArtistId(artist, token);
    if (!artistId) {
      return res.status(404).render('noResultsFound', {
        artist: artist || 'Unknown artist',
        title: 'Artist not found',
      });
    }

    // Fetch all albums for the artist
    const albums = await getArtistAlbums(artistId, token);
    if (!albums || albums.length === 0) {
      return res.status(404).render('noResultsFound', {
        artist: artist || 'Unknown artist',
        title: 'No albums found',
      });
    }

    // Render the albums page with dynamic title and artist info
    res.status(200).render('artistAlbums', {
      albums,
      artist: albums[0]?.artist || artist || 'Unknown Artist',
      title: `All albums of ${albums[0]?.artist || artist || 'Unknown Artist'}`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
};

export const artistProfileController = async (req, res, next) => {
  try {
    const token = getTokenOrThrowNewAppError();

    const artist = req.query.artist;

    if (!artist) {
      return res
        .status(400)
        .render('noResultsFound', { title: 'Missing artist name' });
    }

    // Get artist ID from Spotify API
    const artistId = await getArtistId(artist, token);
    if (!artistId) {
      return res.status(404).render('noResultsFound', {
        artist: artist || 'Unknown Artist',
        title: 'Artist not found',
      });
    }

    // Fetch full artist information
    const artistData = await getArtistInfo(artistId, token);
    if (!artistData) {
      return res.status(404).render('noResultsFound', {
        artist: artist || 'Unknown Artist',
        title: 'Artist not found',
      });
    }

    // Render the artist profile page with dynamic title
    res.status(200).render('artistInfo', {
      artistData,
      title: `${
        artistData?.name || artist || 'Unknown Artist'
      } - Artist Profile`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
};

export const artistRedirectController = (req, res) => {
  const { artist, option } = req.query;

  if (!artist) {
    return res.status(404).render('noResultsFound', {
      artist: artist || 'Unknown Artist',
      title: 'No artist entered',
    });
  }

  switch (option) {
    case 'allAlbums':
      return res
        .status(302)
        .redirect(`/artists/albums?artist=${encodeURIComponent(artist)}`);
    case 'topTracks':
      return res
        .status(302)
        .redirect(`/artists/top-tracks?artist=${encodeURIComponent(artist)}`);
    case 'details':
      return res
        .status(302)
        .redirect(`/artists/profile?artist=${encodeURIComponent(artist)}`);
    default:
      return res
        .status(302)
        .redirect(`/artists/profile?artist=${encodeURIComponent(artist)}`);
  }
};

export const artistAutocompleteController = async (req, res, next) => {
  try {
    const token = getTokenOrThrowNewAppError();

    // Read the search query from the request body
    const query = req.body.query;
    if (!query) return res.status(200).json([]); // return empty array if no query provided

    // Call helper function to fetch artist list from Spotify API
    const artistsList = await getArtistsList(query, token);

    // Send the array of artist names back to the frontend as JSON
    res.status(200).json(artistsList);
  } catch (err) {
    // Forward any errors to the global error handler
    next(err);
  }
};
