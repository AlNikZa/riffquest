// services/artistService.js

import { config } from '../config/env.js';

import { checkSpotifyResponse } from './foreignApiHelpers.js';
/* ----------------- checkSpotifyResponse -----------------
   Helper function to handle Spotify API responses.
   Throws AppError for common Spotify-level errors (401, 429, other failures).
   Successful responses (response.ok) simply pass through.
   Errors are intentionally thrown to be caught by the global error handler.
---------------------------------------------------------- */

/* -------------------- getArtistId --------------------
   Search for an artist by name and return the Spotify artist ID.
   Returns null if no matching artist is found.
   Errors are intentionally not caught here so they can propagate to the global error handler; 
   only valid "not found" cases return null.
   ------------------------------------------------------ */
export const getArtistId = async (artist, TOKEN) => {
  // Make a search request to Spotify API for the artist
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artist
    )}&type=artist&limit=1`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );

  checkSpotifyResponse(response);

  const data = await response.json();

  if (!data.artists?.items?.length) return null; // no artist found

  const foundArtist = data.artists.items[0];

  // Function to normalize names for comparison (remove accents, lowercase, remove non-alphanumeric chars)
  const normalize = (str) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/^(the|a|an)/, '');

  // Check if the normalized artist name includes the search term
  if (!normalize(foundArtist.name).includes(normalize(artist))) return null;

  return foundArtist.id; // return Spotify artist ID
};

/* ----------------- getArtistTopTracks -----------------
   Fetch top tracks for an artist by artist ID.
   Returns an array of simplified track objects.
   Errors are intentionally not caught here so they can propagate to the global error handler; 
   only valid "not found" cases return [].
------------------------------------------------------ */
export const getArtistTopTracks = async (artistId, TOKEN) => {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );

  checkSpotifyResponse(response);

  const data = await response.json();

  if (!data?.tracks?.length) {
    return [];
  }

  const songsAllData = data.tracks;

  // Extract only the relevant info for each track
  const extractedSongsData = songsAllData.map((song) => {
    return {
      artist: song.artists[0].name || 'Unknown Artist',
      album: song.album.name || 'Unknown Album',
      name: song.name,
      year: song.album.release_date.slice(0, 4) || null,
      image: song.album.images[2]?.url || song.album.images[0]?.url || null,
      url: song.external_urls.spotify,
      href: song.href,
      id: song.id,
      popularity: song.popularity,
    };
  });

  return extractedSongsData;
};

/* ------------------ getAlbumDuration ------------------
   Fetch all tracks of an album and calculate total duration.
   Returns a string formatted as "H:MM:SS" or "MM:SS".
------------------------------------------------------ */
const getAlbumDuration = async (albumId, TOKEN) => {
  try {
    let allTracks = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (!response.ok) {
        if (!config.isProd) {
          console.warn(
            `Could not fetch album tracks for ${albumId}: ${response.status}`
          );
        }
        return 'Unknown'; // fail quietly
      }

      const data = await response.json();
      allTracks = allTracks.concat(data.items);

      if (!data.items || data.items.length < limit) hasMore = false;
      else offset += limit;
    }

    // Safe sum of durations
    let total_ms = allTracks.reduce(
      (sum, song) => sum + (song?.duration_ms || 0),
      0
    );

    const hours = Math.floor(total_ms / 3600000);
    const minutes = Math.floor((total_ms % 3600000) / 60000);
    const seconds = Math.floor((total_ms % 60000) / 1000);

    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return hours >= 1
      ? `${hours}:${minutesStr}:${secondsStr}`
      : `${minutesStr}:${secondsStr}`;
  } catch (err) {
    return 'Unknown'; // fallback duration
  }
};

/* ------------------ getArtistAlbums -------------------
   Fetch all albums for an artist by artist ID.
   Returns an array of album objects with additional info including duration.
   Errors are intentionally not caught here so they can propagate to the global error handler;
   only valid "not found" cases (artist has no albums) return an empty array.
------------------------------------------------------ */
export const getArtistAlbums = async (artistId, TOKEN) => {
  let albums = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    checkSpotifyResponse(response);

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      hasMore = false;
    } else {
      // For each album, calculate its total duration
      const extractedAlbumsData = await Promise.all(
        data.items.map(async (album) => {
          const albumDuration = await getAlbumDuration(album.id, TOKEN);
          return {
            artist: album.artists[0].name,
            album: album.name,
            year: album.release_date.slice(0, 4),
            image: album.images[1]?.url,
            id: album.id,
            popularity: album.popularity,
            url: album.external_urls.spotify,
            duration: albumDuration,
          };
        })
      );

      albums = albums.concat(extractedAlbumsData);
      offset += limit;
    }
  }

  // Sort albums chronologically
  albums.sort((a, b) => Number(a.year) - Number(b.year));

  return albums;
};

/* ------------------- getArtistInfo --------------------
   Fetch full artist information (genres, followers, images, etc.) by artist ID.
   Returns the full Spotify artist object or null if no data is returned.
   Errors propagate to the global error handler for central management.
------------------------------------------------------ */
export const getArtistInfo = async (artistId, TOKEN) => {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );

  checkSpotifyResponse(response);

  const data = await response.json();

  if (!data) return null;

  return data;
};

/* ------------------- getArtistsList --------------------
   Fetch a list of artists from Spotify matching the search query.
   Returns an array of artist names (or full artist objects if needed).
   Fail quietly: network or API errors return an empty array.
-------------------------------------------------------- */
export const getArtistsList = async (query, TOKEN) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=artist&limit=5`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.artists?.items?.map((artist) => artist.name) || [];
  } catch (error) {
    return [];
  }
};
