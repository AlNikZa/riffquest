// services/artistService.js

import axios from 'axios';

import { config } from '../config/env.js';
import { checkSpotifyResponse } from './foreignApiHelpers.js';

const spotifyFetch = async (
  url,
  token,
  timeout = 8000,
  retries = 3,
  retryDelay = 500,
) => {
  if (!token) throw new Error('Spotify token is missing');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout,
      });
      const { status, statusText, data, headers } = response;

      return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        data,
        headers: {
          get: (key) => headers[key.toLowerCase()],
        },
      };
    } catch (err) {
      // Timeout or network problem
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelay));
        continue;
      }

      // HTTP error
      if (err.response) {
        throw new Error(
          `Spotify API error: ${err.response.status} ${err.response.statusText}`,
        );
      }

      // Timeout or network problem
      if (err.code === 'ECONNABORTED') {
        throw new Error(`Request timed out after ${timeout}ms: ${url}`);
      }

      throw new Error(`Spotify fetch failed: ${err.message}`);
    }
  }
};

/* ==================== getArtistId ====================
   Searches Spotify for an artist by name and returns
   the Spotify artist ID.

   - Returns null if no suitable match is found
   - Legitimate "not found" cases return null
   - All other errors are propagated to the global
     error handler
====================================================== */

export const getArtistId = async (artist, TOKEN) => {
  // Make a search request to Spotify API for the artist
  const response = await spotifyFetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`,
    TOKEN,
  );

  checkSpotifyResponse(response);

  const data = response.data;

  if (!data.artists?.items?.length) return null; // no artist found

  const foundArtist = data.artists.items[0];

  // Normalize artist names for reliable comparison  (remove accents, lowercase, remove non-alphanumeric chars, remove leading articles (the, a, an))
  const normalize = (str = '') =>
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
  const response = await spotifyFetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    TOKEN,
  );

  checkSpotifyResponse(response);

  const data = response.data;

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
      year: song.album.release_date?.slice(0, 4) || null,
      image: song.album.images[2]?.url || song.album.images[0]?.url || null,
      url: song.external_urls.spotify,
      href: song.href,
      id: song.id,
      popularity: song.popularity,
    };
  });

  return extractedSongsData;
};

/* ================= formatAlbumDuration =================
   Converts total milliseconds into:
   - "H:MM:SS" if duration >= 1 hour
   - "MM:SS" otherwise
======================================================= */

const formatAlbumDuration = (total_ms) => {
  const hours = Math.floor(total_ms / 3600000);
  const minutes = Math.floor((total_ms % 3600000) / 60000);
  const seconds = Math.floor((total_ms % 60000) / 1000);

  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');

  return hours >= 1
    ? `${hours}:${minutesStr}:${secondsStr}`
    : `${minutesStr}:${secondsStr}`;
};

/* ------------------ getAlbumDuration ------------------
   Fetch all tracks of an album and calculate total duration.
   - Handles pagination internally
   - Returns formatted duration string
   - Fails quietly and returns "Unknown" on errors
   ------------------------------------------------------ */
const getAlbumDuration = async (albumId, TOKEN) => {
  try {
    let allTracks = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await spotifyFetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
        TOKEN,
        20000,
      );

      if (!response.ok) {
        if (!config.isProd) {
          console.warn(
            `Could not fetch album tracks for ${albumId}: ${response.status}`,
          );
        }
        return 'Unknown'; // fail quietly
      }

      const data = response.data;
      allTracks = allTracks.concat(data.items);

      if (!data.items || data.items.length < limit) hasMore = false;
      else offset += limit;
    }

    // Safe sum of durations
    let total_ms = allTracks.reduce(
      (sum, song) => sum + (song?.duration_ms || 0),
      0,
    );

    return formatAlbumDuration(total_ms);
  } catch (err) {
    return 'Unknown'; // fallback duration
  }
};

/* =================== getArtistAlbums ===================
   Fetches all albums for an artist and enriches them
   with detailed metadata and total duration.

   Optimizations:
   - Pagination for album IDs
   - De-duplication by album ID
   - Parallel batch fetching (Spotify max 20 IDs)
   - Conditional fallback duration calculation
======================================================= */
export const getArtistAlbums = async (artistId, TOKEN) => {
  let albumStubs = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  // Phase 1: Fetch all album IDs (paginated)
  while (hasMore) {
    const response = await spotifyFetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=${limit}&offset=${offset}`,
      TOKEN,
    );

    checkSpotifyResponse(response);
    const data = response.data;

    if (!data.items?.length) break;

    albumStubs = albumStubs.concat(data.items);
    if (data.items.length < limit) hasMore = false;
    else offset += limit;
  }

  // De-duplicate albums by ID
  albumStubs = Array.from(new Map(albumStubs.map((a) => [a.id, a])).values());

  if (albumStubs.length === 0) return [];

  // Phase 2: Parallel batch processing

  // Split albumStubs into chunks of 20 (Spotify API limit)
  const chunks = [];
  for (let i = 0; i < albumStubs.length; i += 20) {
    chunks.push(albumStubs.slice(i, i + 20));
  }

  // Map every chunk into Promise (asynchronous operation)
  const batchPromises = chunks.map(async (chunk) => {
    try {
      const ids = chunk.map((a) => a.id).join(',');

      const response = await spotifyFetch(
        `https://api.spotify.com/v1/albums?ids=${ids}`,
        TOKEN,
      );

      checkSpotifyResponse(response);
      const { albums: detailedChunk } = response.data;

      // For every album inside detailed batch process data and duration
      return Promise.all(
        detailedChunk.filter(Boolean).map(async (fullAlbum) => {
          let duration;

          if (fullAlbum.tracks.total > fullAlbum.tracks.limit) {
            duration = await getAlbumDuration(fullAlbum.id, TOKEN);
          } else {
            const totalMs = fullAlbum.tracks.items.reduce(
              (sum, t) => sum + (t.duration_ms || 0),
              0,
            );
            duration = formatAlbumDuration(totalMs);
          }

          return {
            artist: fullAlbum.artists[0].name,
            album: fullAlbum.name,
            year: fullAlbum.release_date?.slice(0, 4) || null,
            image: fullAlbum.images[1]?.url || fullAlbum.images[0]?.url || null,
            id: fullAlbum.id,
            popularity: fullAlbum.popularity,
            url: fullAlbum.external_urls.spotify,
            duration: duration,
          };
        }),
      );
    } catch (err) {
      if (!config.isProd) {
        console.warn('Album batch failed:', err.message);
      }
      return [];
    }
  });

  // Waiting for all batches, and their inner processes to finish
  const nestedResults = [];
  for (const batch of batchPromises) {
    nestedResults.push(await batch);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Flattening array of arrays into single albums array
  const allDetailedAlbums = nestedResults.flat();

  const result = allDetailedAlbums.sort(
    (a, b) => Number(a.year) - Number(b.year),
  );

  return result;
};

/* ------------------- getArtistInfo --------------------
   Fetch full artist information (genres, followers, images, etc.) by artist ID.
   Returns the full Spotify artist object or null if no data is returned.
   Errors propagate to the global error handler for central management.
------------------------------------------------------ */
export const getArtistInfo = async (artistId, TOKEN) => {
  const response = await spotifyFetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    TOKEN,
  );

  checkSpotifyResponse(response);

  const data = response.data;

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
    const response = await spotifyFetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
      TOKEN,
    );

    if (!response.ok) {
      return [];
    }

    const data = response.data;

    return data.artists?.items?.map((artist) => artist.name) || [];
  } catch (error) {
    return [];
  }
};
