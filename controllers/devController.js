import listRoutes from 'express-list-routes';
import directoryTree from 'directory-tree';
import mongoose from 'mongoose';

import { generateFileTreeString, countNodes } from '../services/devService.js';

export const getAllRoutesListController = (req, res) => {
  const routes = listRoutes(req.app, { logger: false });

  const routesAdditionalInfo = {
    total: routes.length,
    byMethod: {
      GET: routes.filter((r) => r.method.includes('GET')).length,
      POST: routes.filter((r) => r.method.includes('POST')).length,
      PUT: routes.filter((r) => r.method.includes('PUT')).length,
      PATCH: routes.filter((r) => r.method.includes('PATCH')).length,
      DELETE: routes.filter((r) => r.method.includes('DELETE')).length,
    },
  };

  routes.unshift({
    ...routesAdditionalInfo,
  });
  res.status(200).json(routes);
};

export const getFileTreeController = (req, res) => {
  const treeObject = directoryTree(process.cwd(), {
    attributes: ['type'],
    exclude: [
      /\.git/,
      /node_modules/,
      /\.env$/,
      /\.vscode/,
      /sessions/,
      /logs/,
      /package-lock\.json$/,
      /project_notes\.md$/,
      /README\.md$/,
    ],
  });

  const counts = countNodes(treeObject);
  const fileTreeString =
    generateFileTreeString(treeObject) +
    `\n${counts.dirs - 1} directories, ${counts.files} files`;

  res.status(200).send(`<pre>${fileTreeString}</pre>`);
};

export const getDatabaseCollectionController = async (req, res, next) => {
  const { collection } = req.params;

  try {
    const allowedCollections = ['users', 'sessions'];
    if (!allowedCollections.includes(collection)) {
      return res.status(400).json({ error: 'Invalid collection' });
    }

    const coll = mongoose.connection.db.collection(collection);
    const documents = await coll.find({}).limit(100).toArray();
    res.json(documents);
  } catch (err) {
    next(err);
  }
};
