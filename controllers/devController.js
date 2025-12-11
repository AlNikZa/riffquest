import listRoutes from 'express-list-routes';
import directoryTree from 'directory-tree';

import { generateFileTreeString, countNodes } from '../services/devService.js';

export const getAllRoutesListController = (req, res) => {
  const routes = listRoutes(req.app, { logger: false });
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
