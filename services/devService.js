const renderFileTree = (node, prefix = '', isLast = true) => {
  let output = '';
  const linePrefix = isLast ? '└──' : '├──';
  const nextPrefix = isLast ? '    ' : '│   ';

  output += `${prefix}${linePrefix} ${node.name}\n`;

  if (node.children) {
    node.children.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const isChildLast = i === node.children.length - 1;
      output += renderFileTree(child, prefix + nextPrefix, isChildLast);
    }
  }

  return output;
};

const renderTreeNode = (node, prefix = '', isLast = true) => {
  const linePrefix = isLast ? '└── ' : '├── ';
  const nextPrefix = isLast ? '    ' : '│   ';

  let output = `${prefix}${linePrefix}${node.name}\n`;

  if (node.children && node.children.length > 0) {
    node.children.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    node.children.forEach((child, i) => {
      const last = i === node.children.length - 1;
      output += renderTreeNode(child, prefix + nextPrefix, last);
    });
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

export const generateFileTreeString = (treeObject) => {
  let output = `${treeObject.name}/\n│\n`;

  const children = treeObject.children || [];
  const total = children.length;

  children.sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  children.forEach((child, i) => {
    const isLast = i === total - 1;

    if (child.type === 'directory') {
      output += renderTreeNode(child, '', isLast);
      output += '│\n';
    }

    if (child.type === 'file') {
      output += `${isLast ? '└─ ' : '├─ '}${child.name}\n`;
    }
  });

  return output;
};
