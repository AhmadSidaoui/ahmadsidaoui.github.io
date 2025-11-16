// Dependencies
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from "@octokit/rest";

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const CSV_FILES = {
  data: path.join(__dirname, 'DocumentTraker.csv'),
  chart: path.join(__dirname, 'savings_data.csv'),
  bar: path.join(__dirname, 'cost_data.csv')
};
// Log the CSV file paths
console.log("📁 CSV File Paths:", CSV_FILES);

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_ACCESSTOKEN ;
const GITHUB_CONFIG = {
  owner: 'AhmadSidaoui',
  repo: 'ahmadsidaoui.github.io'
};

if (!GITHUB_TOKEN) {
  console.error("❌ GitHub token not found!");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });






/////////////////////////////////////////////////////////////
// CSV Manager Class
/////////////////////////////////////////////////////////////






// Utility Functions
class CSVManager {

    // Read CSV file and return data as array of objects
    static async readCSV(filePath) {
        
        try {
        // Read file content
        const content = await fs.readFile(filePath, 'utf8');
        // Parse CSV content to array of objects
        const lines = content.trim().split('\n');
        
        if (lines.length === 0) return [];

        // Extract headers
        const headers = lines[0].split(',').map(h => h.trim());
        // Map lines to objects
        return lines.slice(1).map(line => {
            const values = line.split(',');
            // Create a js object for each row
            const row = {}; 
            headers.forEach((header, index) => {
            row[header] = (values[index] || '').trim();
            });
            return row;
        });
        } catch (error) {
        if (error.code === 'ENOENT') return []; // File doesn't exist
        throw error;
        }
    }


  static async writeCSV(filePath, newData) {
    if (!newData || newData.length === 0) {
      await fs.writeFile(filePath, '');
      return;
    }

    const headers = Object.keys(newData[0]);
    const csvContent = [
      headers.join(','),
      ...newData.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');

    await fs.writeFile(filePath, csvContent);
  }

  static async appendCSV(filePath, newData) {
    const existingData = await this.readCSV(filePath);
    const mergedData = [...existingData, ...newData];
    await this.writeCSV(filePath, mergedData);
  }
}





/////////////////////////////////////////////////////////////
// GitHub Service Class
/////////////////////////////////////////////////////////////





class GitHubService {
  static async commitFile(filePath, commitMessage) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const contentBase64 = Buffer.from(fileContent).toString('base64');

      let sha;
      try {
        const { data } = await octokit.repos.getContent({
          ...GITHUB_CONFIG,
          path: path.basename(filePath),
        });
        sha = data.sha;
      } catch (err) {
        sha = undefined; // File doesn't exist on GitHub
      }

      await octokit.repos.createOrUpdateFileContents({
        ...GITHUB_CONFIG,
        path: path.basename(filePath),
        message: commitMessage,
        content: contentBase64,
        sha,
      });

      console.log(`✅ ${path.basename(filePath)} committed to GitHub`);
      return true;
    } catch (err) {
      console.error("❌ GitHub commit failed:", err.message);
      return false;
    }
  }
}








/////////////////////////////////////////////////////////////
// Request Handler Class
/////////////////////////////////////////////////////////////





// Request Handler with Router Pattern
class RequestHandler {

  static async handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(200).end();
      return;
    }

    console.log(`${method} ${pathname}`);

    try {
      // Route handling
      const routes = {
        'GET:/api/data': () => this.handleGetCSV(CSV_FILES.data),
        'GET:/api/chart/data': () => this.handleGetCSV(CSV_FILES.chart),
        'GET:/api/bar/data': () => this.handleGetCSV(CSV_FILES.bar),
        'POST:/api/save': () => this.handlePostCSV(CSV_FILES.data),
        'POST:/api/chart/save': () => this.handlePostChart(),
      };

      const routeHandler = routes[`${method}:${pathname}`];
      if (routeHandler) {
        await routeHandler.call(this, req, res);
      } else {
        await this.handleStaticFiles(req, res, pathname);
      }
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }



  static async handleGetCSV(filePath) {
    const data = await CSVManager.readCSV(filePath);
    return { success: true, data };
  }



  static async handlePostCSV(req, res, filePath) {
    const body = await this.parseRequestBody(req);
    const { data } = body;

    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    await CSVManager.appendCSV(filePath, data);
    await GitHubService.commitFile(filePath, `Update ${path.basename(filePath)} via server`);
    
    this.sendJson(res, 200, { success: true, message: 'Data saved successfully' });
  }




  static async handlePostChart(req, res) {
    const body = await this.parseRequestBody(req);
    const { csvData } = body;

    if (typeof csvData !== 'string') {
      throw new Error('csvData must be a string');
    }

    await fs.writeFile(CSV_FILES.chart, csvData, 'utf8');
    await GitHubService.commitFile(CSV_FILES.chart, 'Update chart data via server');
    
    this.sendJson(res, 200, { success: true, message: 'Chart data saved successfully' });
  }



  static async handleStaticFiles(req, res, pathname) {
    const staticFiles = {
      '/': 'index.html',
      '/index.html': 'index.html',
      '/style.css': 'style.css',
      '/main.js': 'main.js'
    };

    const file = staticFiles[pathname];
    if (file) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf8');
        const contentType = this.getContentType(file);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (error) {
        this.sendError(res, 404, `${file} not found`);
      }
    } else {
      this.sendError(res, 404, 'Not found');
    }
  }
  

  static async parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  static sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  static sendError(res, statusCode, message) {
    this.sendJson(res, statusCode, { success: false, error: message });
  }

  static getContentType(filename) {
    const ext = path.extname(filename);
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json'
    };
    return types[ext] || 'text/plain';
  }
}

// Server Initialization
async function initializeServer() {
  // Initialize CSV files if they don't exist
  for (const [key, filePath] of Object.entries(CSV_FILES)) {
    try {
      await fs.access(filePath);
      console.log(`✅ ${key} CSV file exists`);
    } catch (error) {
      const sampleData = key === 'data' 
        ? `Name,Age,City\nJohn Doe,30,New York\nJane Smith,25,London`
        : '';
      await fs.writeFile(filePath, sampleData);
      console.log(`📁 Created ${key} CSV file`);
    }
  }

  const server = http.createServer(RequestHandler.handleRequest.bind(RequestHandler));
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 CSV files: ${Object.values(CSV_FILES).map(f => path.basename(f)).join(', ')}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} busy, trying ${Number(PORT) + 1}...`);
      server.listen(Number(PORT) + 1);
    } else {
      console.error('❌ Server error:', error);
    }
  });

  return server;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Server interrupted');
  process.exit(0);
});

// Start server
initializeServer().catch(console.error);