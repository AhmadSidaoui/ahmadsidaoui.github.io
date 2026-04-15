import path from 'path';

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

export function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}