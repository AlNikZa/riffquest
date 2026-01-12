// config/session.js

import { config } from './env.js';

import session from 'express-session';
import MongoStore from 'connect-mongo';

export const sessionInit = () => {
  const store = MongoStore.create({
    mongoUrl: config.mongo.uri,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // = 86400 seconds = 1 day
    autoRemove: 'native',
    touchAfter: 3600,
    crypto: {
      secret: config.encryptionKey,
    },
  });

  store.on('error', (err) => {
    console.error('❌ Session Store Error:', err);
  });

  return session({
    name: 'riffQuestSessionId',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
    proxy: config.isProd,
    cookie: {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
      secure: config.isProd, // true on Render, false locally
      sameSite: config.isProd ? 'none' : 'lax',
      httpOnly: true,
    },
    rolling: true,
  });
};
