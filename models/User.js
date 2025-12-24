// models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
    token_expires_in: {
      type: Number,
      required: true,
    },

    display_name: {
      type: String,
      default: null,
    },
    profile_img: {
      type: String,
      default: null,
    },
    followers: {
      type: Number,
      default: 0,
    },
    spotify_user_id: {
      type: String,
      required: true,
      unique: true,
    },
    // Using Number instead of Date to store Unix timestamp in milliseconds.
    // This allows for direct mathematical operations (addition/comparison)
    // during token expiration checks in the middleware without object conversion overhead.
    token_created_timestamp: {
      type: Number,
      default: null,
    },
  },

  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
