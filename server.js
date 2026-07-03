import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(root, 'dist');
const port = Number(process.env.PORT) || 4173;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

function resolvePath(urlPath) {
  const pathname = new URL(urlPath, 'http://localhost').pathname;
  const requested = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '').replace(/^(\.\.[/\\])+/, '');
  const filePath = join(distDir, requested === '' ? 'index.html' : requested);

  if (existsSync(filePath) && statSync(filePath).isFile()) return filePath;
  if (extname(requested)) return '';
  return join(distDir, 'index.html');
}

createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  const ext = extname(filePath);

  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  createReadStream(filePath)
    .on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('Server error');
    })
    .on('open', () => {
      res.writeHead(200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream'
      });
    })
    .pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`Portfolio running on port ${port}`);
});
