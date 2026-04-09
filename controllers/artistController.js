// controllers/artistController.js

import { matchedData } from 'express-validator';

import {
  findBestArtistMatch,
  getArtistsList,
  getMappedArtistData,
} from '../services/artistService.js';

import { catchAsync } from '../utils/catchAsync.js';

export const artistSuggestionsController = catchAsync(
  async (req, res, next) => {
    const { artist } = matchedData(req);

    const artistsList = await getArtistsList(artist);

    res.status(200).json({
      status: 'success',
      results: artistsList?.length || 0,
      data: artistsList || [],
    });
  },
);

export const artistSearchController = catchAsync(async (req, res, next) => {
  const { artist } = matchedData(req);

  const results = await getArtistsList(artist);

  const bestMatch = findBestArtistMatch(results);

  if (!bestMatch) {
    return res.status(404).json({
      status: 'fail',
      message: 'Artist not found',
    });
  }

  res.status(302).redirect(`/artists/${bestMatch.id}`);
});

export const getArtistByIdController = catchAsync(async (req, res, next) => {
  const { id } = matchedData(req);

  const mappedArtist = await getMappedArtistData(id);

  if (!mappedArtist) {
    return res.status(404).json({
      status: 'fail',
      message: 'Artist details not found',
    });
  }

  res.status(200).json({ status: 'success', data: mappedArtist });
});
