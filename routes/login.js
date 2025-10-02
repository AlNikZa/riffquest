import express from 'express';
import { exchangeCodeForToken } from '../functions/loginFunctions.js';
import { getUserData } from '../functions/userFunctions.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/login', (req, res) => {
  // const scope = 'user-read-private user-read-email';
  const scope =
    'playlist-read-private playlist-read-collaborative user-top-read user-library-read';

  const redirect_uri =
    process.env.NODE_ENV === 'production'
      ? 'https://riffquest.onrender.com/callback'
      : 'http://127.0.0.1:3000/callback';

  // Build query string using URLSearchParams (modern alternative to querystring)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.CLIENT_ID,
    scope: scope,
    redirect_uri: redirect_uri,
  });

  // Final Spotify authorization URL
  const authUrl = 'https://accounts.spotify.com/authorize?' + params.toString();

  // Redirect the user to Spotify's login/authorization page
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  // Get the authorization code sent by Spotify in the query string
  const code = req.query.code;

  try {
    // Exchange the authorization code for access and refresh tokens
    // The function handles both production and development redirect URIs
    const userTokens = await exchangeCodeForToken(
      code,
      process.env.NODE_ENV === 'production'
    );

    // Log the tokens (access_token, refresh_token, expires_in) for debugging
    console.log('Spotify user tokens:', userTokens);

    const userData = await getUserData(userTokens.access_token);
    const userDoc = {
      token_created_timestamp: Date.now(),
      access_token: userTokens.access_token,
      refresh_token: userTokens.refresh_token,
      expires_in: userTokens.expires_in,
      user_created_timestamp: Date.now(),
      display_name: userData.display_name,
      followers: userData.followers?.total || 0,
      spotifyUserId: userData.id,
    };

    try {
      // Prepare only the fields we want to update for an existing user
      const updateFields = {
        access_token: userDoc.access_token, // Update access token
        refresh_token: userDoc.refresh_token, // Update refresh token
        expires_in: userDoc.expires_in, // Update token expiry
        token_created_timestamp: userDoc.token_created_timestamp, // Update token creation time
        display_name: userDoc.display_name, // Update display name
        followers: userDoc.followers, // Update followers count
      };

      const user = await User.findOneAndUpdate(
        { spotifyUserId: userDoc.spotifyUserId }, // Find user by Spotify ID
        { $set: updateFields }, // Only update the fields in updateFields
        {
          upsert: true, // If the user doesn't exist, create a new document
          new: true, // Return the updated or newly created document
          setDefaultsOnInsert: true, // Apply default values (like user_created_timestamp) if inserting
        }
      );

      console.log('User saved or updated:', user); // Log the saved or updated user
    } catch (err) {
      console.error('Error saving user:', err); // Log any errors
    }

    // Example
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://riffquestsandbox.onrender.com' // production URL
        : 'http://localhost:3000'; // local development

    res.redirect(baseUrl + '/');
  } catch (error) {
    // Catch and log any errors during the token exchange
    console.error(error);
    res.status(500).send(error.message);
  }
});
export default router;
