import { CSVService } from '../services/csvService.js';
import { GitHubService } from '../services/githubService.js';
import { parseJsonBody } from '../utils/request.js';
import { sendJson, sendError } from '../utils/response.js';
import { CSV_FILES } from '../config/paths.js';

export async function deleteTask(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { task } = body;

    if (!task) {
      return sendError(res, 400, "Missing 'task' field");
    }

    const tasks = await CSVService.read(CSV_FILES.task);
    const filtered = tasks.filter(t => t.Task !== task);

    if (filtered.length === tasks.length) {
      return sendError(res, 404, 'Task not found');
    }

    await CSVService.write(CSV_FILES.task, filtered);
    await GitHubService.commitFile(CSV_FILES.task, `Deleted task: ${task}`);

    sendJson(res, 200, { success: true, message: `Task '${task}' deleted` });
  } catch (error) {
    sendError(res, 500, error.message);
  }
}