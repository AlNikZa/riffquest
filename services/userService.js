// services/userService.js

import User from '../models/User.js';
import { encrypt } from '../services/cryptoService.js';
import { checkSpotifyResponse } from './foreignApiHelpers.js';

import { AppError } from '../AppError.js';

export const getUserById = async (spotify_user_id) => {
  try {
    const user = await User.findOne({ spotify_user_id });
    return user;
  } catch (err) {
    throw new AppError('Database error while fetching user', 500);
  }
};

export const getUserData = async (userAccessToken) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    checkSpotifyResponse(response);

    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Internal error fetching user data', 500);
  }
};

export const upsertSpotifyUser = async (userDoc) => {
  try {
    // Prepare only the fields to update for an existing user
    // NOTE: access_token and refresh_token are expected to be already encrypted
    const updateFields = {
      access_token: userDoc.access_token, // Update access token
      refresh_token: userDoc.refresh_token, // Update refresh token
      token_expires_in: userDoc.token_expires_in, // Update token expiry
      display_name: userDoc.display_name, // Update display name
      profile_img: userDoc.profileImg,
      followers: userDoc.followers, // Update followers count
      token_created_timestamp: Date.now(),
    };

    await User.findOneAndUpdate(
      { spotify_user_id: userDoc.spotify_user_id }, // Find user by Spotify ID
      {
        $set: updateFields,
        $setOnInsert: {
          spotify_user_id: userDoc.spotify_user_id,
        },
      },

      {
        upsert: true, // If the user doesn't exist, create a new document
        new: true, // Return the updated or newly created document
        setDefaultsOnInsert: true, // Apply default values (like user_created_timestamp) if inserting
      }
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Database error during user upsert', 500);
  }
};
//
export const updateSpotifyUser = async (updatedUserTokens, spotify_user_id) => {
  try {
    await User.updateOne(
      { spotify_user_id: spotify_user_id },
      {
        $set: {
          access_token: encrypt(updatedUserTokens.accessToken),
          refresh_token: encrypt(updatedUserTokens.refreshToken),
          token_expires_in: updatedUserTokens.expiresIn,
          token_created_timestamp: Date.now(),
        },
      }
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Database error during token update', 500);
  }
};

export const getUserDocObject = (userTokens, userData) => {
  try {
    const encryptedAccessToken = encrypt(userTokens.access_token);
    const encryptedRefreshToken = encrypt(userTokens.refresh_token);

    const userDoc = {
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_in: userTokens.expires_in,
      display_name: userData.display_name,
      profileImg: userData.images?.[0]?.url || null,
      followers: userData.followers?.total || 0,
      spotify_user_id: userData.id,
    };

    return userDoc;
  } catch (error) {
    throw new AppError('Failed to prepare secure user data object', 500);
  }
};
