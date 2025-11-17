import { getTokenOrRenderLoadingPage } from '../services/globalTokenService.js';

export const homePageController = (req, res) => {
  // Get the Spotify API token; if not ready, render loading page
  const token = getTokenOrRenderLoadingPage(res);
  if (!token) return;
  // Render the home page with a title
  res.render('index', { title: 'Riff Quest' });
};

export const cookiePolicyPageController = (req, res) => {
  res.render('cookiePolicy', { title: 'Riff Quest Cookie Policy' });
};
