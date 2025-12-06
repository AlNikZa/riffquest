import { removeTokensForUser } from '../services/userTokenService.js';
import { getReturnToCookie } from '../services/loginService.js';

export const logoutController = async (req, res) => {
  if (!req.session?.spotify_user_id) {
    return res.status(302).redirect('/');
  }

  //  Remove the user's Spotify tokens from the database
  await removeTokensForUser(req.session.spotify_user_id);

  //   Destroy the Express session
  req.session.destroy((err) => {
    if (err) {
      // If there's an error destroying the session, log it and send a 500 response
      console.error('❌ Error destroying session: ', err);
      return res.status(500).send('Error logging out');
    } else {
      //   Clear the session cookie from the browser
      const isLocal = process.env.BASE_URL_DEV === 'http://127.0.0.1:3000';
      res.clearCookie('riffQuestSessionId', {
        path: '/',
        secure: !isLocal,
        sameSite: isLocal ? 'lax' : 'none',
        httpOnly: true,
      });

      //   Redirect the user to the current or homepage after logout
      const returnTo = getReturnToCookie(req);
      res.status(302).redirect(returnTo || req.get('Referer') || '/');
    }
  });
};
