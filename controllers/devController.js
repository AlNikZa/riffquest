// controllers/devController.js

import mongoose from 'mongoose';

import {
  generateFileTreeString,
  countNodes,
  getWorkingDiff,
} from '../services/devService.js';

export const getAllRoutesListController = async (req, res) => {
  // Dynamic import prevents production crashes as this package is in devDependencies
  const { default: listRoutes } = await import('express-list-routes');

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

export const getFileTreeController = async (req, res) => {
  // Dynamic import prevents production crashes as this package is in devDependencies
  const { default: directoryTree } = await import('directory-tree');

  const showDates = req.query.showDates === 'true';

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
    generateFileTreeString(treeObject, showDates) +
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

export const getCommitsController = async (req, res, next) => {
  try {
    const { username, repo } = req.query;
    const branchName = req.query.branch || 'main';
    const limit = parseInt(req.query.limit) || 10;

    if (!username || !repo) {
      const missingParams = [];
      if (!username) missingParams.push('username');
      if (!repo) missingParams.push('repo');

      return res.status(400).json({
        status: 'fail',
        message: `parameter${
          missingParams.length > 1 ? 's' : ''
        } required: ${missingParams.join(', ')}.`,
      });
    }

    let page = 1;
    let commits = [];

    while (commits.length < limit) {
      const perPage = Math.min(100, limit - commits.length);
      const apiUrl =
        `https://api.github.com/repos/${username}/${repo}/commits` +
        `?sha=${branchName}&per_page=${perPage}&page=${page}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.length === 0) break;

      const filteredData = data.map((item) => {
        const lines = item.commit.message.split('\n');

        const subject = lines[0].trim();

        const bodyArray = lines
          .slice(1)
          .map((line) => line.trim().replace(/^[-*]\s*/, ''))
          .filter((line) => line.length > 0);

        return {
          date: item.commit.committer.date,
          subject: subject,
          body: bodyArray,
        };
      });

      commits.push(...filteredData);

      if (data.length < perPage) break;
      page++;
    }

    const slicedCommits = commits.slice(0, limit);

    const totalResponse = await fetch(
      `https://api.github.com/repos/${username}/${repo}/commits?sha=${branchName}&per_page=1`
    );
    const linkHeader = totalResponse.headers.get('link');

    let totalCommitsCount = null;
    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match) {
        totalCommitsCount = parseInt(match[1]);
      }
    } else {
      const data = await totalResponse.json();
      totalCommitsCount = data.length;
    }

    res.status(200).json({
      username,
      repo,
      branch: branchName,
      totalCommitsCount,
      requestedLimit: limit,
      returnedCommitsCount: slicedCommits.length,
      commits: slicedCommits,
    });
  } catch (err) {
    next(err);
  }
};

export const getDiffController = async (req, res, next) => {
  try {
    const diffText = await getWorkingDiff();

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <html>
        <head>
          <style>
            body { background: #edeff3ff; color: #1b1c1dff; font-family: monospace; padding: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
            .addition { color: #3fb950; }
            .deletion { color: #f85149; }
            .header { color: #58a6ff; font-weight: bold; }
          </style>
        </head>
        <body>
          <h3>RiffQuest Working Directory Diff</h3>
          <pre>${diffText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;') // escape HTML
            .split('\n')
            .map((line) => {
              if (line.startsWith('+') && !line.startsWith('+++'))
                return `<span class="addition">${line}</span>`;
              if (line.startsWith('-') && !line.startsWith('---'))
                return `<span class="deletion">${line}</span>`;
              if (line.startsWith('diff') || line.startsWith('@@'))
                return `<span class="header">${line}</span>`;
              return line;
            })
            .join('\n')}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`❌ Error: ${err.toString()}`);
  }
};
