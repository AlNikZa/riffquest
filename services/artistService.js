// services/artistService.js

import { config } from '../config/env.js';
import { spotifyApi } from '../config/axios.js';

import {
  chunkArray,
  uniqueBy,
  sortByNumericProperty,
} from '../utils/arrayUtils.js';
import { normalizeString } from '../utils/stringUtils.js';
import {
  formatAlbumDuration,
  calculateTotalDuration,
} from '../utils/timeUtils.js';
import { mapSpotifyTrack, mapSpotifyAlbum } from '../mappers/spotifyMapper.js';

// Internal helper to check if the found artist name matches the search query.
const isArtistMatch = (foundName = '', searchName = '') => {
  const normalizedFound = normalizeString(foundName);
  const normalizedSearch = normalizeString(searchName);

  return normalizedFound.includes(normalizedSearch);
};

// Searches Spotify for an artist by name and returns their Spotify artist ID.
// Returns null if no suitable match is found.
export const getArtistId = async (artist, TOKEN) => {
  const response = await spotifyApi.get('/search', {
    params: {
      q: artist,
      type: 'artist',
      limit: 1,
    },
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const data = response.data;
  if (!data.artists?.items?.length) return null; // no artist found

  const foundArtist = data.artists.items[0];
  // Validate the result using string normalization to prevent false positives
  if (!isArtistMatch(foundArtist.name, artist)) return null;

  return foundArtist.id; // return Spotify artist ID
};

// Fetches top tracks for an artist and maps them to a simplified format.
export const getArtistTopTracks = async (artistId, TOKEN) => {
  const response = await spotifyApi.get(`/artists/${artistId}/top-tracks`, {
    params: {
      market: 'US',
    },
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const tracks = response.data?.tracks;

  // If no tracks are found or data is missing, return an empty array
  if (!tracks || !Array.isArray(tracks)) {
    return [];
  }

  // Map each track to our simplified application format
  return tracks.map(mapSpotifyTrack);
};

// Fetches all tracks for an album (handles pagination) and calculates total duration.
// Returns formatted string "H:MM:SS" or "MM:SS", or "Unknown" on failure.
const getAlbumDuration = async (albumId, TOKEN) => {
  try {
    let allTracks = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await spotifyApi.get(`/albums/${albumId}/tracks`, {
        params: {
          limit,
          offset,
        },
        headers: { Authorization: `Bearer ${TOKEN}` },
        timeout: 20000,
      });

      const data = response.data;
      allTracks = allTracks.concat(data.items || []);

      if (!data.items || data.items.length < limit) hasMore = false;
      else offset += limit;
    }

    // Safe sum of durations
    const total_ms = calculateTotalDuration(allTracks);

    return formatAlbumDuration(total_ms);
  } catch (err) {
    if (!config.isProd) {
      console.warn(`Could not fetch tracks for album ${albumId}:`, err.message);
    }
    return 'Unknown'; // fallback duration
  }
};

// Fetches all albums for an artist, enriches them with detailed metadata and duration.
// Includes pagination, de-duplication, and parallel batch processing.
export const getArtistAlbums = async (artistId, TOKEN) => {
  let albumStubs = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  // 1. Fetch all basic album data (stubs) using pagination
  while (hasMore) {
    const response = await spotifyApi.get(`/artists/${artistId}/albums`, {
      params: {
        include_groups: 'album',
        limit,
        offset,
      },
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    const data = response.data;
    if (!data.items?.length) break;

    albumStubs = albumStubs.concat(data.items);
    if (data.items.length < limit) hasMore = false;
    else offset += limit;
  }

  // De-duplicate albums by ID to avoid repeats from different regions
  albumStubs = uniqueBy(albumStubs, 'id');
  if (albumStubs.length === 0) return [];

  // 2. Process detailed data in batches (Spotify API limit is 20 IDs per request)
  const chunks = chunkArray(albumStubs, 20);

  // Map every chunk into Promise (asynchronous operation)
  const batchPromises = chunks.map(async (chunk) => {
    try {
      const ids = chunk.map((a) => a.id).join(',');
      const response = await spotifyApi.get('/albums', {
        params: {
          ids,
        },
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      const { albums: detailedChunk } = response.data;

      // Map each album and calculate duration (conditional fetch if tracks exceed limit)
      return Promise.all(
        detailedChunk.filter(Boolean).map(async (fullAlbum) => {
          let duration;

          if (fullAlbum.tracks.total > fullAlbum.tracks.limit) {
            duration = await getAlbumDuration(fullAlbum.id, TOKEN);
          } else {
            const totalMs = calculateTotalDuration(fullAlbum.tracks.items);
            duration = formatAlbumDuration(totalMs);
          }

          return mapSpotifyAlbum(fullAlbum, duration);
        }),
      );
    } catch (err) {
      if (!config.isProd) {
        console.warn('Album batch failed:', err.message);
      }
      return [];
    }
  });

  // 3. Resolve batches sequentially with a small delay to respect rate limits
  const nestedResults = [];
  for (const batch of batchPromises) {
    nestedResults.push(await batch);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Flatten nested arrays and sort the final list by release year
  const allDetailedAlbums = nestedResults.flat();
  return sortByNumericProperty(allDetailedAlbums, 'year');
};

// Fetch full artist information (genres, followers, images, etc.) by artist ID.
export const getArtistInfo = async (artistId, TOKEN) => {
  const response = await spotifyApi.get(`/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const data = response.data;
  if (!data) return null;
  return data;
};

// Fetch a list of artist names from Spotify matching the search query.
// Returns an empty array on network or API errors.
export const getArtistsList = async (query, TOKEN) => {
  try {
    const response = await spotifyApi.get('/search', {
      params: {
        q: query,
        type: 'artist',
        limit: 5,
      },
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    const data = response.data;

    return data.artists?.items?.map((artist) => artist.name) || [];
  } catch (error) {
    return [];
  }
};
