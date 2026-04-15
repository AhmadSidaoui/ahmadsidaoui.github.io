import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const GITHUB_TOKEN = process.env.GITHUB_ACCESSTOKEN;

if (!GITHUB_TOKEN) {
  throw new Error('Missing GITHUB_ACCESSTOKEN');
}