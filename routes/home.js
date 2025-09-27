import express from 'express';
import { getTokenOrRenderLoadingPage } from '../functions/tokenFunctions.js';

const router = express.Router();
/* ------------------------------------------------------------- */
/* ---------------------- Home Page Route ---------------------- */
/* ------------------------------------------------------------- */

router.get('/', (req, res) => {
  // Get the Spotify API token; if not ready, render loading page
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;

  // Render the home page with a title
  res.render('index', { title: 'RiffQuest' });
});

export default router;
