import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  token_created_timestamp: {
    type: Date,
    default: Date.now,
  },
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  expires_in: {
    type: Number,
    required: true,
  },
  user_created_timestamp: {
    type: Date,
    default: Date.now,
  },
  display_name: {
    type: String,
    default: null,
  },
  followers: {
    type: Number,
    default: 0,
  },
  spotifyUserId: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
