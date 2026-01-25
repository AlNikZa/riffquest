// controllers/artistController.js

import { getTokenOrThrowNewAppError } from '../services/globalTokenService.js';
import {
  getArtistTopTracks,
  getArtistAlbums,
  getArtistInfo,
  getArtistsList,
} from '../services/artistService.js';

import { AppError } from '../AppError.js';

export const artistTopTracksController = async (req, res, next) => {
  try {
    const artistName = req.query.artist;
    const { token, artistId } = req;

    // Fetch top tracks for the artist
    const topTracks = await getArtistTopTracks(artistId, token);
    if (!topTracks || topTracks.length === 0) {
      return next(
        new AppError(`No top tracks found for artist "${artistName}".`, 404),
      );
    }

    // Render the top tracks page with dynamic title
    res.status(200).render('artistTopTracks', {
      topTracks,
      artist: topTracks[0]?.artist || artistName || 'Unknown Artist',
      title: `The Best Of ${
        topTracks[0]?.artist || artistName || 'Unknown Artist'
      }`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
};

export const artistAlbumsController = async (req, res, next) => {
  try {
    const artistName = req.query.artist;
    const { token, artistId } = req;

    // Fetch all albums for the artist
    const albums = await getArtistAlbums(artistId, artistName, token);
    if (!albums || albums.length === 0) {
      return next(
        new AppError(`No albums found for artist "${artistName}".`, 404),
      );
    }

    // Render the albums page with dynamic title and artist info
    res.status(200).render('artistAlbums', {
      albums,
      artist: albums[0]?.artist || artistName || 'Unknown Artist',
      title: `All albums of ${
        albums[0]?.artist || artistName || 'Unknown Artist'
      }`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
};

export const artistProfileController = async (req, res, next) => {
  try {
    const artistName = req.query.artist;
    const { token, artistId } = req;

    // Fetch full artist information
    const artistData = await getArtistInfo(artistId, token);
    if (!artistData) {
      return next(
        new AppError(`No data found for artist "${artistName}".`, 404),
      );
    }

    // Render the artist profile page with dynamic title
    res.status(200).render('artistInfo', {
      artistData,
      title: `${
        artistData?.name || artistName || 'Unknown Artist'
      } - Artist Profile`,
    });
  } catch (err) {
    next(err); //  Forward error to global error handler
  }
};

export const artistRedirectController = (req, res, next) => {
  const { artist, option } = req.query;

  if (!artist) {
    return next(new AppError('Please provide an artist name.', 400));
  }

  if (!option) {
    return next(
      new AppError('Please provide an option to be redirected to.', 400),
    );
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
    const token = await getTokenOrThrowNewAppError();

    // Read the search query from the request query
    const query = req.query.query?.trim();
    if (!query) return res.status(200).json([]); // return empty array if no query provided

    // Call helper function to fetch artist list from Spotify API
    const artistsList = await getArtistsList(query, token);

    // Send the array of artist names back to the frontend as JSON
    res.status(200).json(artistsList || []);
  } catch (err) {
    // Forward any errors to the global error handler
    next(err);
  }
};
