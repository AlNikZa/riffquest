import express from 'express';
import { removeTokensForUser } from '../functions/userTokenFunctions.js';
import { getReturnToCookie } from '../functions/loginFunctions.js';

const router = express.Router();
//
router.get('/logout', async (req, res) => {
  //  Remove the user's Spotify tokens from the database
  await removeTokensForUser(req.session.spotify_user_id);

  //   Destroy the Express session
  req.session.destroy((err) => {
    if (err) {
      // If there's an error destroying the session, log it and send a 500 response
      console.error('❌ Error destroying session:', err);
      return res.status(500).send('Error logging out');
    } else {
      console.log('✅ Session destroyed');
      //   Clear the session cookie from the browser
      res.clearCookie('connect.sid', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      //   Redirect the user to the current or homepage after logout
      const returnTo = getReturnToCookie(req);
      res.redirect(returnTo || req.get('Referer') || '/');
    }
  });
});
//

export default router;
