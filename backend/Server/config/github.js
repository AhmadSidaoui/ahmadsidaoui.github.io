import { Octokit } from '@octokit/rest';
import { GITHUB_TOKEN } from './env.js';

export const githubConfig = {
  owner: 'AhmadSidaoui',
  repo: 'ahmadsidaoui.github.io'
};

export const octokit = new Octokit({ auth: GITHUB_TOKEN });