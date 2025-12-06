import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from './db.js';

const isLocal = process.env.BASE_URL_DEV === 'http://127.0.0.1:3000';

export const sessionInit = () => {
  return session({
    name: 'riffQuestSessionId',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // = 86400 seconds = 1 day
      autoRemove: 'native',
    }),
    cookie: {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
      secure: !isLocal, // true on Render, false locally
      sameSite: isLocal ? 'lax' : 'none',
      httpOnly: true,
    },
    rolling: true,
  });
};
