import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env } from '../env.config.js';

const BASE_PATH = env.FILES_BASE_PATH;

/**
 * Save a file buffer to disk.
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} subfolder 
 * @returns {Promise<{filename: string, relativePath: string, absolutePath: string}>}
 */
export const saveFile = async (buffer, originalName, subfolder = '') => {
  const targetDir = path.join(BASE_PATH, subfolder);
  await fs.mkdir(targetDir, { recursive: true });
  
  const ext = path.extname(originalName);
  const filename = `${crypto.randomUUID()}${ext}`;
  const absolutePath = path.join(targetDir, filename);
  const relativePath = path.join(subfolder, filename);
  
  await fs.writeFile(absolutePath, buffer);
  
  return {
    filename,
    relativePath,
    absolutePath
  };
};

export const getFile = async (relativePath) => {
    const fullPath = path.join(BASE_PATH, relativePath);
    try {
        return await fs.readFile(fullPath);
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
};
