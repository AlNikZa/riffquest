// middleware/returnTo.js

export const setReturnToCookie = (req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.originalUrl.startsWith('/login') &&
    !req.originalUrl.startsWith('/callback') &&
    !req.originalUrl.startsWith('/logout')
  ) {
    //  Skip static files (images, CSS, JS, icons, etc.)
    if (
      req.originalUrl.match(
        /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|map)$/i
      )
    ) {
      return next();
    }

    const host = req.get('host');
    const validHosts = [
      'riffquest.onrender.com',
      'www.riffquest.onrender.com',
      'riffquestsandbox.onrender.com',
      'www.riffquestsandbox.onrender.com',
      '127.0.0.1:3000',
      'localhost:3000',
    ];

    // If the host is not on the list, skip setting the cookie
    if (!validHosts.includes(host)) {
      console.log(`⚠️  Invalid host attempted to set returnTo cookie: ${host}`);
      return next();
    }
    const currentURL = req.protocol + '://' + host + req.originalUrl;

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
