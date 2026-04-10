// services/artistService.js

import qs from 'qs';

import { musicBrainzApi, lastFmApi, fanartTvApi } from '../config/axios.js';

import { mapMusicBrainzArtist } from '../mappers/musicBrainzMapper.js';
import { mapLastFmArtist } from '../mappers/lastFmMapper.js';

import { normalizeString } from '../utils/stringUtils.js';

const escapeLucene = (str) => {
  return str.replace(/([+\-!(){}[\]^"~?:|\\/])/g, '\\$1');
};

const isArtistMatch = (foundName = '', searchName = '') => {
  const normalizedFound = normalizeString(foundName);
  const normalizedSearch = normalizeString(searchName);

  return normalizedFound.includes(normalizedSearch);
};

const extractFanart = (data) => {
  if (!data) return {};

  return {
    background: data.artistbackground?.[0]?.url || null,
    logo: data.hdmusiclogo?.[0]?.url || data.musiclogo?.[0]?.url || null,
    thumbnail: data.artistthumb?.[0]?.url || null,
  };
};

export const getArtistId = async (artist) => {
  const response = await musicBrainzApi.get('/artist', {
    params: {
      query: `artist:"${artist}"`,
      limit: 1,
    },
  });

  const data = response.data;

  if (!data.artists || data.artists.length === 0) return null;

  const foundArtist = data.artists[0];

  if (!isArtistMatch(foundArtist.name, artist)) return null;

  return foundArtist.id;
};

export const getArtistsList = async (query) => {
  try {
    const safeQuery = escapeLucene(query);

    let luceneQuery;
    const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(query);

    if (hasSpecialChars) {
      luceneQuery = `artist:"${safeQuery}" OR alias:"${safeQuery}"`;
    } else {
      luceneQuery = `artist:${safeQuery}* OR alias:${safeQuery}*`;
    }

    const response = await musicBrainzApi.get('/artist', {
      params: {
        query: luceneQuery,
        limit: 5,
      },
    });

    const data = response.data;

    return (
      data.artists?.map((artist) => ({
        name: artist.name,
        id: artist.id,
        country: artist.country || artist.area?.name || '',
        score: artist.score || 0,
      })) || []
    );
  } catch (error) {
    console.error('MusicBrainz API error:', error.message);
    return [];
  }
};

export const findBestArtistMatch = (artists) => {
  if (!artists?.length) return null;

  return artists.reduce((best, current) => {
    return (current.score ?? 0) > (best?.score ?? 0) ? current : best;
  }, null);
};

export const getMappedArtistData = async (mbid) => {
  try {
    const [mbResponse, lfmResponse, fanartTvResponse] = await Promise.all([
      musicBrainzApi.get(`/artist/${mbid}`, {
        params: {
          inc: 'release-groups+artist-rels+aliases',
        },
        paramsSerializer: (params) => qs.stringify(params, { encode: false }),
      }),
      lastFmApi
        .get('', {
          params: {
            method: 'artist.getInfo',
            mbid: mbid,
            format: 'json',
          },
        })
        .catch((err) => {
          console.error('Last.fm API Error:', err.message);
          return { data: null };
        }),
      fanartTvApi.get(`/music/${mbid}`).catch((err) => {
        console.error('Fanat.tv API Error:', err.message);
        return { data: null };
      }),
    ]);

    const mbData = mbResponse.data;
    const lfmData = lfmResponse.data?.artist;
    const fanartTvData = fanartTvResponse.data;

    const mappedMbData = mapMusicBrainzArtist(mbData);

    let mappedLfmData = {};
    if (lfmData) {
      mappedLfmData = mapLastFmArtist(lfmData);
    }

    const mappedData = {
      ...mappedMbData,
      ...mappedLfmData,
      images: extractFanart(fanartTvData),
    };

    return mappedData;
  } catch (error) {
    console.error(error);
    return null;
  }
};
