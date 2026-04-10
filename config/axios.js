// config/axios.js

import axios from 'axios';

import { config } from './env.js';

import { mapExternalApiError } from '../mappers/externalApiErrorMapper.js';

// MusicBrainz API instance
export const musicBrainzApi = axios.create({
  baseURL: config.musicBrainz.baseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'User-Agent': config.musicBrainz.userAgent,
  },
  params: {
    fmt: config.musicBrainz.format,
  },
  // paramsSerializer: (params) => qs.stringify(params, { encode: false }),
});

musicBrainzApi.interceptors.response.use(
  (response) => response,
  (error) => {
    throw mapExternalApiError(error, 'MusicBrainz API');
  },
);

// Last.fm API instance
export const lastFmApi = axios.create({
  baseURL: config.lastFm.baseUrl,
  timeout: 8000,
  params: {
    api_key: config.lastFm.apiKey,
    format: 'json',
  },
});

lastFmApi.interceptors.response.use(
  (response) => response,
  (error) => {
    throw mapExternalApiError(error, 'Last.fm API');
  },
);

// Fanart.tv API instance
export const fanartTvApi = axios.create({
  baseURL: config.fanartTv.baseUrl,
  timeout: 8000,
  params: {
    api_key: config.fanartTv.apiKey,
  },
});

fanartTvApi.interceptors.response.use(
  (response) => response,
  (error) => {
    throw mapExternalApiError(error, 'Fanart.tv API');
  },
);
