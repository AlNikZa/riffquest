// middleware/userSession.js

export function userSessionMiddleware(req, res, next) {
  res.locals.isLoggedIn = Boolean(req.session.spotify_user_id);
  res.locals.justLoggedIn = req.session.justLoggedIn;
  res.locals.username = req.session.username;
  res.locals.userImg = req.session.userImg;

  if (req.session.justLoggedIn) {
    req.session.justLoggedIn = false;
  }

  next();
}
