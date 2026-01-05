// config/session.js

/**
 * TODO: Enable reverse proxy trust for production
 * Context: Render uses a load balancer/reverse proxy.
 * Without 'proxy: true', the 'secure: true' cookie will not be sent
 * because Express won't recognize the connection as HTTPS.
 * Action: Add 'proxy: !isLocal' to the session config object.
 */

import session from 'express-session';
import MongoStore from 'connect-mongo';

const isLocal = process.env.NODE_ENV !== 'production';

export const sessionInit = () => {
  const store = MongoStore.create({
    mongoUrl: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.${process.env.MONGO_HOST}.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // = 86400 seconds = 1 day
    autoRemove: 'native',
  });

  store.on('error', (err) => {
    console.error('❌ Session Store Error:', err);
  });

  return session({
    name: 'riffQuestSessionId',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
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
