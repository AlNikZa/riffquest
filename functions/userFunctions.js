import User from '../models/User.js';

export const getUserData = async (userAccessToken) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('❌ Error in getUserData function: ', err);
    throw err;
  }
};

export const upsertSpotifyUser = async (userDoc) => {
  try {
    // Prepare only the fields we want to update for an existing user
    const updateFields = {
      access_token: userDoc.access_token, // Update access token
      refresh_token: userDoc.refresh_token, // Update refresh token
      token_expires_in: userDoc.token_expires_in, // Update token expiry
      // token_created_timestamp: userDoc.token_created_timestamp, // Update token creation time
      display_name: userDoc.display_name, // Update display name
      profile_img: userDoc.profileImg,
      followers: userDoc.followers, // Update followers count
      token_created_timestamp: Date.now(),
    };

    const user = await User.findOneAndUpdate(
      { spotify_user_id: userDoc.spotify_user_id }, // Find user by Spotify ID
      {
        $set: updateFields,
        $setOnInsert: {
          spotify_user_id: userDoc.spotify_user_id,
          // user_created_timestamp: userDoc.user_created_timestamp,
        },
      },

      {
        upsert: true, // If the user doesn't exist, create a new document
        new: true, // Return the updated or newly created document
        setDefaultsOnInsert: true, // Apply default values (like user_created_timestamp) if inserting
      }
    );
  } catch (err) {
    console.error('❌ Error in upsertSpotifyUser function: ', err); // Log any errors
  }
};
//
export const updateSpotifyUser = async (updatedUserTokens, spotify_user_id) => {
  try {
    await User.updateOne(
      { spotify_user_id: spotify_user_id },
      {
        $set: {
          access_token: updatedUserTokens.accessToken,
          refresh_token: updatedUserTokens.refreshToken,
          token_expires_in: updatedUserTokens.expiresIn,
          token_created_timestamp: Date.now(),
        },
      }
    );
  } catch (err) {
    console.error('❌ Error in updateSpotifyUser function: ', err); // Log any errors
  }
};

export const getUserDocObject = (userTokens, userData) => {
  const userDoc = {
    access_token: userTokens.access_token,
    refresh_token: userTokens.refresh_token,
    token_expires_in: userTokens.expires_in,
    display_name: userData.display_name,
    profileImg: userData.images?.[0]?.url || null,
    followers: userData.followers?.total || 0,
    spotify_user_id: userData.id,
  };
  return userDoc;
};
