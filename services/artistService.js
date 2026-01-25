// services/artistService.js

import { config } from '../config/env.js';

import { checkSpotifyResponse } from './foreignApiHelpers.js';

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
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artist,
    )}&type=artist&limit=1`,
    { headers: { Authorization: `Bearer ${TOKEN}` } },
  );

  checkSpotifyResponse(response);

  const data = await response.json();

  if (!data.artists?.items?.length) return null; // no artist found

  const foundArtist = data.artists.items[0];

  // Normalize artist names for reliable comparison  (remove accents, lowercase, remove non-alphanumeric chars, remove leading articles (the, a, an))
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
    { headers: { Authorization: `Bearer ${TOKEN}` } },
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
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } },
      );

      if (!response.ok) {
        if (!config.isProd) {
          console.warn(
            `Could not fetch album tracks for ${albumId}: ${response.status}`,
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
export const getArtistAlbums = async (artistId, artistName, TOKEN) => {
  console.time(`⏱️ Total time for artist ${artistName}`);

  let albumStubs = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  // Phase 1: Fetch all album IDs (paginated)
  console.time('  ↳ Phase 1: Fetching album IDs');
  while (hasMore) {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );

    checkSpotifyResponse(response);
    const data = await response.json();

    if (!data.items?.length) break;

    albumStubs = albumStubs.concat(data.items);
    if (data.items.length < limit) hasMore = false;
    else offset += limit;
  }

  console.log(`  ℹ️ Processing artist: ${artistName}`);

  console.timeEnd('  ↳ Phase 1: Fetching album IDs');

  // De-duplicate albums by ID
  const originalCount = albumStubs.length;
  albumStubs = Array.from(new Map(albumStubs.map((a) => [a.id, a])).values());
  console.log(
    `  ℹ️ Found ${originalCount} items, reduced to ${albumStubs.length} unique albums.`,
  );

  if (albumStubs.length === 0) return [];

  // Phase 2: Parallel batch processing
  console.time('  ↳ Phase 2: Parallel Batch Processing');

  // Split albumStubs into chunks of 20 (Spotify API limit)
  const chunks = [];
  for (let i = 0; i < albumStubs.length; i += 20) {
    chunks.push(albumStubs.slice(i, i + 20));
  }

  // Map every chunk into Promise (asynchronous operation)
  const batchPromises = chunks.map(async (chunk) => {
    const ids = chunk.map((a) => a.id).join(',');

    const response = await fetch(
      `https://api.spotify.com/v1/albums?ids=${ids}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );

    checkSpotifyResponse(response);
    const { albums: detailedChunk } = await response.json();

    // For every album inside detailed batch process data and duration
    return Promise.all(
      detailedChunk.filter(Boolean).map(async (fullAlbum) => {
        let duration;

        if (fullAlbum.tracks.total > fullAlbum.tracks.limit) {
          const startFallback = Date.now();
          duration = await getAlbumDuration(fullAlbum.id, TOKEN);
          console.log(
            `    ⚠️ Fallback for "${fullAlbum.name}" took ${Date.now() - startFallback}ms`,
          );
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
          year: fullAlbum.release_date.slice(0, 4),
          image: fullAlbum.images[1]?.url || fullAlbum.images[0]?.url || null,
          id: fullAlbum.id,
          popularity: fullAlbum.popularity,
          url: fullAlbum.external_urls.spotify,
          duration: duration,
        };
      }),
    );
  });

  // Waiting for all batches, and their inner processes to finish
  const nestedResults = [];
  for (const batch of batchPromises) {
    nestedResults.push(await batch);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Flattening array of arrays into single albums array
  const allDetailedAlbums = nestedResults.flat();

  console.timeEnd('  ↳ Phase 2: Parallel Batch Processing');

  const result = allDetailedAlbums.sort(
    (a, b) => Number(a.year) - Number(b.year),
  );
  console.timeEnd(`⏱️ Total time for artist ${artistName}`);
  console.log(
    `Number of albums for artist: ${artistName} : ` + allDetailedAlbums.length,
  );

  return result;
};

/* ------------------- getArtistInfo --------------------
   Fetch full artist information (genres, followers, images, etc.) by artist ID.
   Returns the full Spotify artist object or null if no data is returned.
   Errors propagate to the global error handler for central management.
------------------------------------------------------ */
export const getArtistInfo = async (artistId, TOKEN) => {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } },
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
        query,
      )}&type=artist&limit=5`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
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
