// middleware/userTokenMiddleware.js

import { refreshUserToken } from '../services/userTokenService.js';
import { updateSpotifyUser, getUserById } from '../services/userService.js';
import { decrypt } from '../services/cryptoService.js';

export const ensureValidUserToken = async (req, res, next) => {
  // 1. If no user is in the session, skip (public route)
  if (!req.session.spotify_user_id) return next();

  try {
    const user = await getUserById(req.session.spotify_user_id);
    if (!user) return next();

    // 2. Calculate if the token is near expiration (e.g., less than 5 minutes remaining)
    const tokenLifeMs = user.token_expires_in * 1000;
    const expirationTime = user.token_created_timestamp + tokenLifeMs;
    const isNearlyExpired = Date.now() > expirationTime - 300000;

    if (isNearlyExpired) {
      const decryptedRefresh = decrypt(user.refresh_token);
      const newTokens = await refreshUserToken(decryptedRefresh);

      // 3. Update the database (this replaces the previous setTimeout logic)
      await updateSpotifyUser(newTokens, user.spotify_user_id);
    }

    next();
  } catch (error) {
    // If refresh fails, the user will likely receive a 401 on the API call,
    // which is preferable to crashing the entire application here
    next();
  }
};
