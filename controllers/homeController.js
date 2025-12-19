// controllers/homeController.js

export const homePageController = (req, res) => {
  // Render the home page with a title
  res.status(200).render('index', { title: 'Riff Quest' });
};

export const cookiePolicyPageController = (req, res) => {
  res.status(200).render('cookiePolicy', { title: 'Riff Quest Cookie Policy' });
};
