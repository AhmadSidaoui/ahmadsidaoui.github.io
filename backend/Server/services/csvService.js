import fs from 'fs/promises';

export class CSVService {
  static async read(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.trim().split('\n');
      if (!lines.length || !lines[0]) return [];

      const headers = lines[0].split(',').map(h => h.trim());

      return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, i) => {
          row[header] = (values[i] || '').trim();
        });
        return row;
      });
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  static async write(filePath, rows) {
    if (!rows.length) {
      await fs.writeFile(filePath, '');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => row[h] ?? '').join(','))
    ].join('\n');

    await fs.writeFile(filePath, csv, 'utf8');
  }
}