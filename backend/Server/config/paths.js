import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = __dirname;

export const CSV_FILES = {
  data: path.join(__dirname, '../../DocumentTraker.csv'),
  chart: path.join(__dirname, '../../savings_data.csv'),
  bar: path.join(__dirname, '../../cost_data.csv'),
  task: path.join(__dirname, '../../TaskManager.csv')
};