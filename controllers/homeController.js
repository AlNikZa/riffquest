import { getTokenOrRenderLoadingPage } from '../services/globalTokenService.js';

export const homePageController = (req, res) => {
  // Get the Spotify API token; if not ready, render loading page
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;
  // Render the home page with a title
  res.status(200).render('index', { title: 'Riff Quest' });
};

export const cookiePolicyPageController = (req, res) => {
  res.status(200).render('cookiePolicy', { title: 'Riff Quest Cookie Policy' });
};
