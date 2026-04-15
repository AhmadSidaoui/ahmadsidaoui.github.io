import fs from 'fs/promises';
import path from 'path';
import { sendError } from '../utils/response.js';

const STATIC_FILES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/style.css': 'style.css',
  '/main.js': 'main.js'
};

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

export async function serveStatic(res, pathname) {
  const file = STATIC_FILES[pathname];
  if (!file) return sendError(res, 404, 'Not found');

  try {
    const filePath = path.join(process.cwd(), file);
    const content = await fs.readFile(filePath, 'utf8');
    const ext = path.extname(file);
    const contentType = CONTENT_TYPES[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    sendError(res, 404, `${file} not found`);
  }
}