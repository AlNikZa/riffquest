// config/session.js

/**
 * TODO: Enable reverse proxy trust for production
 * Context: Render uses a load balancer/reverse proxy.
 * Without 'proxy: true', the 'secure: true' cookie will not be sent
 * because Express won't recognize the connection as HTTPS.
 * Action: Add 'proxy: !isLocal' to the session config object.
 */

import { config } from './env.js';

import session from 'express-session';
import MongoStore from 'connect-mongo';

export const sessionInit = () => {
  const store = MongoStore.create({
    mongoUrl: config.mongo.uri,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // = 86400 seconds = 1 day
    autoRemove: 'native',
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
