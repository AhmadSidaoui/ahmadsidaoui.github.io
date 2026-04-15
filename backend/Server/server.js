import http from 'http';
import { PORT } from './config/env.js';
import { handleRequest } from './app.js';

const server = http.createServer((req, res) => {
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});