// mappers/errorRegistry/artistErrors.js

import { createErrorFactory } from '../../utils/errorHelpers.js';

const artistErrors = {
	noTracksFound: ({ artistName }) => ({
		message: `No top tracks found for artist "${artistName}". Please check spelling.`,
		errorCode: 'NO_TRACKS_FOR_THE_ARTIST',
		statusCode: 404,
		devMessage: `Spotify API returned empty top tracks for the given artist: ${artistName}`,
		metadata: {
			artistName,
		},
	}),
	noAlbumsFound: ({ artistName }) => ({
		message: `No albums found for artist "${artistName}".`,
		errorCode: 'NO_ALBUMS_FOR_THE_ARTIST',
		statusCode: 404,
		devMessage: `Spotify API returned empty album list for artist: ${artistName}`,
		metadata: {
			artistName,
		},
	}),
	noArtistDetails: ({ artistName }) => ({
		message: `No data found for artist "${artistName}".`,
		errorCode: 'NO_DETAILS_FOR_THE_ARTIST',
		statusCode: 404,
		devMessage: `getArtistInfo returned null or undefined for artist: ${artistName}`,
		metadata: {
			artistName,
		},
	}),
	noArtistIdFound: ({ artistName }) => ({
		message: `Sorry, we couldn't find an artist named "${artistName}".`,
		errorCode: 'ARTIST_ID_NOT_FOUND',
		statusCode: 404,
		devMessage: `Spotify API search returned no results (ID not found) for: ${artistName}`,
		metadata: {
			artistName,
		},
	}),
};

export const createArtistError = createErrorFactory('ARTIST', artistErrors);
