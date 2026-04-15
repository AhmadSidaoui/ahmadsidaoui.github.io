import { CSV_FILES } from '../config/paths.js';
import { getCsvData, saveCsvData } from '../controllers/dataController.js';
import { deleteTask } from '../controllers/taskController.js';
import { serveStatic } from '../controllers/staticController.js';

export async function router(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const routes = {
    'GET:/api/data': () => getCsvData(res, CSV_FILES.data),
    'GET:/api/chart/data': () => getCsvData(res, CSV_FILES.chart),
    'GET:/api/bar/data': () => getCsvData(res, CSV_FILES.bar),
    'GET:/api/task/data': () => getCsvData(res, CSV_FILES.task),
    'POST:/api/save': () => saveCsvData(req, res, CSV_FILES.data),
    'POST:/api/chart/save': () => saveCsvData(req, res, CSV_FILES.chart),
    'POST:/api/bar/save': () => saveCsvData(req, res, CSV_FILES.bar),
    'POST:/api/task/save': () => saveCsvData(req, res, CSV_FILES.task),
    'DELETE:/api/task/delete': () => deleteTask(req, res)
  };

  const key = `${method}:${pathname}`;
  const handler = routes[key];

  if (handler) {
    return handler();
  }

  return serveStatic(res, pathname);
}