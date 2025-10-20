// middleware/returnTo.js

export const setReturnToCookie = (req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.originalUrl.startsWith('/login') &&
    !req.originalUrl.startsWith('/callback')
  ) {
    const currentURL = req.protocol + '://' + req.get('host') + req.originalUrl;

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('returnTo', currentURL, {
      httpOnly: true,
      maxAge: 6000 * 1000,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }
  next();
};
