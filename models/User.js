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
    token_created_timestamp: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
