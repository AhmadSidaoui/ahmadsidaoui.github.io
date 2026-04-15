import path from 'path';
import { CSVService } from '../services/csvService.js';
import { GitHubService } from '../services/githubService.js';
import { parseJsonBody } from '../utils/request.js';
import { sendJson, sendError } from '../utils/response.js';

export async function getCsvData(res, filePath) {
  try {
    const data = await CSVService.read(filePath);
    sendJson(res, 200, { success: true, data });
  } catch (error) {
    sendError(res, 500, error.message);
  }
}

export async function saveCsvData(req, res, filePath) {
  try {
    const body = await parseJsonBody(req);
    const { data } = body;

    if (!Array.isArray(data)) {
      return sendError(res, 400, 'Data must be an array');
    }

    await CSVService.write(filePath, data);
    await GitHubService.commitFile(filePath, `Update ${path.basename(filePath)} via server`);

    sendJson(res, 200, { success: true, message: 'Data saved successfully' });
  } catch (error) {
    sendError(res, 500, error.message);
  }
}