import type { TreeNode, FileWithRelativePath, FileStructureItem } from '../types/index';

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Downloads a blob as a file
 * @param blob - Blob to download
 * @param fileName - Name for the downloaded file
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Builds a tree structure from a flat list of files
 * @param files - Array of files with optional relative paths
 * @returns Root tree node
 */
export const buildTreeStructure = (files: File[]): TreeNode => {
  const root: TreeNode = {
    name: 'root',
    path: '',
    isFile: false,
    children: []
  };

  files.forEach(file => {
    const fileWithPath = file as FileWithRelativePath;
    const path = fileWithPath.webkitRelativePath || file.name;
    const parts = path.split('/');
    let currentNode = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let child = currentNode.children.find(c => c.name === part);

      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          isFile,
          size: isFile ? file.size : undefined,
          children: []
        };
        currentNode.children.push(child);
      }

      if (!isFile) {
        currentNode = child;
      }
    });
  });

  return root;
};

/**
 * Extracts folder name from the first file's webkitRelativePath
 * @param files - Array of files
 * @returns Folder name or empty string
 */
export const extractFolderName = (files: File[]): string => {
  if (files.length === 0) return '';
  
  const firstFile = files[0] as FileWithRelativePath;
  if (firstFile.webkitRelativePath) {
    const parts = firstFile.webkitRelativePath.split('/');
    if (parts.length > 1) {
      return parts[0];
    }
  }
  
  return '';
};

/**
 * Builds tree structure from file structure metadata
 * @param fileStructure - Array of file structure items
 * @returns Root tree node
 */
export const buildTreeFromStructure = (fileStructure: FileStructureItem[]): TreeNode => {
  const root: TreeNode = {
    name: 'root',
    path: '',
    isFile: false,
    children: []
  };

  fileStructure.forEach(fileInfo => {
    const parts = fileInfo.path.split('/');
    let currentNode = root;

    parts.forEach((part: string, index: number) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      let existingChild = currentNode.children.find(child => child.name === part);
      
      if (!existingChild) {
        existingChild = {
          name: part,
          path: currentPath,
          isFile,
          size: isFile ? fileInfo.size : undefined,
          encrypted: isFile ? fileInfo.encrypted : undefined,
          children: []
        };
        currentNode.children.push(existingChild);
      }

      currentNode = existingChild;
    });
  });

  return root;
};

/**
 * Builds file tree structure from File array (including webkitRelativePath)
 * @param files - Array of files from file input or drop
 * @returns Root tree node
 */
export const buildFileTree = (files: File[]): TreeNode => {
  const root: TreeNode = {
    name: 'root',
    path: '',
    isFile: false,
    children: []
  };

  files.forEach(file => {
    const fileWithPath = file as FileWithRelativePath;
    const path = fileWithPath.webkitRelativePath || file.name;
    const parts = path.split('/');
    let currentNode = root;

    parts.forEach((part: string, index: number) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');
      
      let child = currentNode.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: currentPath,
          isFile,
          size: isFile ? file.size : undefined,
          children: []
        };
        currentNode.children.push(child);
      }

      if (!isFile) {
        currentNode = child;
      }
    });
  });

  return root;
};

/**
 * Builds tree structure from extracted files object
 * @param extractedFiles - Object with file paths as keys and Uint8Array as values
 * @returns Root tree node
 */
export const buildTreeFromExtractedFiles = (extractedFiles: {[path: string]: Uint8Array}): TreeNode => {
  const root: TreeNode = {
    name: 'root',
    path: '',
    isFile: false,
    children: []
  };

  Object.keys(extractedFiles).forEach(path => {
    const parts = path.split('/');
    let currentNode = root;

    parts.forEach((part: string, index: number) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');
      
      let child = currentNode.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: currentPath,
          isFile,
          size: isFile ? extractedFiles[path].length : undefined,
          children: []
        };
        currentNode.children.push(child);
      }

      if (!isFile) {
        currentNode = child;
      }
    });
  });

  return root;
};