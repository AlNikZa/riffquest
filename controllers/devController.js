import listRoutes from 'express-list-routes';
import directoryTree from 'directory-tree';
import mongoose from 'mongoose';

import { generateFileTreeString, countNodes } from '../services/devService.js';

export const getAllRoutesListController = (req, res) => {
  const routes = listRoutes(req.app, { logger: false });

  const byMethod = routes.reduce((acc, route) => {
    const methods = Array.isArray(route.method) ? route.method : [route.method];

    methods.forEach((method) => {
      acc[method] = (acc[method] || 0) + 1;
    });

    return acc;
  }, {});

  res.status(200).json({
    total: routes.length,
    byMethod,
    routes,
  });
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

export const getCommitsController = (req, res, next) => {
  const username = req.query.username;
  const repo = req.query.repo;
  const branchName = req.query.branch || 'main';
  const limit = parseInt(req.query.limit) || 10;

  const apiUrl = `https://api.github.com/repos/${username}/${repo}/commits?sha=${branchName}&per_page=${limit}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const filteredData = data.map((commit) => ({
        date: commit.commit.committer.date,
        message: commit.commit.message,
      }));
      res.status(200).json(filteredData);
    })
    .catch((err) => {
      next(err);
    });
};
