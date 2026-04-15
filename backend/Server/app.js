import { router } from './routes/index.js';

export async function handleRequest(req, res) {
  try {
    await router(req, res);
  } catch (error) {
    console.error('Unhandled app error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
}