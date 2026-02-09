// config/axios.js

import axios from 'axios';
import { handleSpotifyError } from '../services/foreignApiHelpers.js';

// Spotify API instance (for data)
export const spotifyApi = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  timeout: 10000,
});

spotifyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    throw handleSpotifyError(error, 'Spotify API');
  },
);

// Spotify Auth instance (for tokens)
export const spotifyAuthApi = axios.create({
  baseURL: 'https://accounts.spotify.com/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
});

spotifyAuthApi.interceptors.response.use(
  (response) => response,
  (error) => {
    throw handleSpotifyError(error, 'Spotify Auth');
  },
);
