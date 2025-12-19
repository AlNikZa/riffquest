// services/devService.js

import fs from 'fs';
import { execSync } from 'child_process';

const getFileDates = (filePath) => {
  try {
    const gitCreated = execSync(
      `git log --diff-filter=A --follow --format=%aI -1 -- "${filePath}"`,
      { stdio: ['pipe', 'pipe', 'ignore'] }
    )
      .toString()
      .trim();

    const gitModified = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    })
      .toString()
      .trim();

    return {
      created: gitCreated ? new Date(gitCreated) : null,
      modified: gitModified ? new Date(gitModified) : null,
    };
  } catch {
    try {
      const stats = fs.statSync(filePath);
      return {
        created: stats.birthtime || stats.ctime || null,
        modified: stats.mtime || null,
      };
    } catch {
      return { created: null, modified: null };
    }
  }
};

const annotateDates = (node) => {
  if (node.type === 'file') {
    const { created, modified } = getFileDates(node.path);
    node.created = created;
    node.modified = modified;
  } else if (node.type === 'directory') {
    let earliestCreated = null;
    let latestModified = null;

    if (node.children) {
      node.children.forEach((child) => {
        annotateDates(child);
        if (
          child.created &&
          (!earliestCreated || child.created < earliestCreated)
        )
          earliestCreated = child.created;
        if (
          child.modified &&
          (!latestModified || child.modified > latestModified)
        )
          latestModified = child.modified;
      });
    }

    node.created = earliestCreated;
    node.modified = latestModified;
  }
};

const renderTreeNode = (node, prefix = '', isLast = true, showDates = true) => {
  const linePrefix = isLast ? '└── ' : '├── ';
  const nextPrefix = isLast ? '    ' : '│   ';

  const { created, modified } =
    node.type === 'directory'
      ? { created: node.created, modified: node.modified }
      : getFileDates(node.path);

  const dateStr = showDates
    ? ` (Created: ${
        created ? created.toISOString().split('T')[0] : 'N/A'
      } Modified: ${modified ? modified.toISOString().split('T')[0] : 'N/A'})`
    : '';

  let output = `${prefix}${linePrefix}${node.name}${
    node.type === 'directory' ? '/' : ''
  }${dateStr}\n`;

  if (node.children && node.children.length > 0) {
    node.children.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    node.children.forEach((child, i) => {
      const last = i === node.children.length - 1;
      output += renderTreeNode(child, prefix + nextPrefix, last, showDates);
    });

    output += prefix + '│\n';
  }

  return output;
};

export const countNodes = (node) => {
  let dirs = 0;
  let files = 0;

  if (node.type === 'directory') dirs++;
  if (node.type === 'file') files++;

  if (node.children) {
    for (const child of node.children) {
      const result = countNodes(child);
      dirs += result.dirs;
      files += result.files;
    }
  }

  return { dirs, files };
};

export const generateFileTreeString = (treeObject, showDates = true) => {
  annotateDates(treeObject);

  const dateStr = showDates
    ? ` (Created: ${
        treeObject.created
          ? treeObject.created.toISOString().split('T')[0]
          : 'N/A'
      } Modified: ${
        treeObject.modified
          ? treeObject.modified.toISOString().split('T')[0]
          : 'N/A'
      })`
    : '';

  let output = `${treeObject.name}${
    treeObject.type === 'directory' ? '/' : ''
  }${dateStr}\n│\n`;

  const children = treeObject.children || [];
  const total = children.length;

  children.sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  children.forEach((child, i) => {
    const isLast = i === total - 1;
    output += renderTreeNode(child, '', isLast, showDates);
  });

  return output;
};
