// middleware/userSession.js

export function userSessionMiddleware(req, res, next) {
  res.locals.isLoggedIn = false;
  res.locals.justLoggedIn = false;
  res.locals.username = null;
  res.locals.userImg = null;

  if (!req.session) {
    return next();
  }

  res.locals.isLoggedIn = Boolean(req.session.spotify_user_id);
  res.locals.justLoggedIn = Boolean(req.session.justLoggedIn);
  res.locals.username = req.session.username ?? null;
  res.locals.userImg = req.session.userImg ?? null;

  if (req.session.justLoggedIn) {
    req.session.justLoggedIn = false;
  }

  next();
}
