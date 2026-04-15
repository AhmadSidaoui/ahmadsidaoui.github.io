import fs from 'fs/promises';
import path from 'path';
import { octokit, githubConfig } from '../config/github.js';

export class GitHubService {
  static async commitFile(filePath, message) {
    const repoPath = `backend/${path.basename(filePath)}`;
    const fileContent = await fs.readFile(filePath, 'utf8');
    const content = Buffer.from(fileContent).toString('base64');

    let sha;
    try {
      const existing = await octokit.repos.getContent({
        owner: githubConfig.owner,
        repo: githubConfig.repo,
        path: repoPath
      });
      sha = existing.data.sha;
    } catch {
      sha = undefined;
    }

    return octokit.repos.createOrUpdateFileContents({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path: repoPath,
      message,
      content,
      sha
    });
  }
}