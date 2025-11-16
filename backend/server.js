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

console.log(`🔧 Starting server with PORT: ${PORT}`);
console.log(`🔧 Current directory: ${__dirname}`);

const CSV_FILES = {
  data: path.join(__dirname, 'DocumentTraker.csv'),
  chart: path.join(__dirname, 'savings_data.csv'),
  bar: path.join(__dirname, 'cost_data.csv')
};

// Log the CSV file paths
console.log("📁 CSV File Paths:");
Object.entries(CSV_FILES).forEach(([key, filePath]) => {
  console.log(`   ${key}: ${filePath}`);
});

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_ACCESSTOKEN;
console.log(`🔑 GitHub Token present: ${!!GITHUB_TOKEN}`);
console.log(`🔑 GitHub Token length: ${GITHUB_TOKEN ? GITHUB_TOKEN.length : 0}`);

const GITHUB_CONFIG = {
  owner: 'AhmadSidaoui',
  repo: 'ahmadsidaoui.github.io'
};

console.log(`🔧 GitHub Config:`, GITHUB_CONFIG);

if (!GITHUB_TOKEN) {
  console.error("❌ GitHub token not found!");
  console.error("❌ Please set GITHUB_ACCESSTOKEN environment variable");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
console.log("✅ Octokit initialized");

/////////////////////////////////////////////////////////////
// CSV Manager Class
/////////////////////////////////////////////////////////////

// Utility Functions
class CSVManager {
  // Read CSV file and return data as array of objects
  static async readCSV(filePath) {
    console.log(`📖 Attempting to read CSV: ${filePath}`);
    
    try {
      // Check if file exists first
      await fs.access(filePath);
      console.log(`✅ CSV file exists: ${filePath}`);
      
      // Read file content
      const content = await fs.readFile(filePath, 'utf8');
      console.log(`✅ Read ${content.length} characters from CSV`);
      
      // Parse CSV content to array of objects
      const lines = content.trim().split('\n');
      console.log(`📊 Found ${lines.length} lines in CSV`);
      
      if (lines.length === 0) {
        console.log(`ℹ️ CSV file is empty: ${filePath}`);
        return [];
      }

      // Extract headers
      const headers = lines[0].split(',').map(h => h.trim());
      console.log(`📋 CSV Headers:`, headers);
      
      // Map lines to objects
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        // Create a js object for each row
        const row = {}; 
        headers.forEach((header, index) => {
          row[header] = (values[index] || '').trim();
        });
        return row;
      });
      
      console.log(`✅ Successfully parsed ${data.length} rows from CSV`);
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`❌ CSV file not found: ${filePath}`);
        return []; // File doesn't exist
      }
      console.error(`❌ Error reading CSV ${filePath}:`, error.message);
      throw error;
    }
  }

  static async writeCSV(filePath, newData) {
    console.log(`📝 Writing CSV: ${filePath} with ${newData ? newData.length : 0} rows`);
    
    if (!newData || newData.length === 0) {
      console.log(`ℹ️ No data to write, creating empty file`);
      await fs.writeFile(filePath, '');
      return;
    }

    const headers = Object.keys(newData[0]);
    const csvContent = [
      headers.join(','),
      ...newData.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');

    await fs.writeFile(filePath, csvContent);
    console.log(`✅ Successfully wrote ${csvContent.length} characters to CSV`);
  }

  static async appendCSV(filePath, newData) {
    console.log(`📝 Appending ${newData.length} rows to CSV: ${filePath}`);
    const existingData = await this.readCSV(filePath);
    console.log(`📊 Existing data: ${existingData.length} rows`);
    
    const mergedData = [...existingData, ...newData];
    console.log(`📊 Merged data: ${mergedData.length} rows total`);
    
    await this.writeCSV(filePath, mergedData);
  }
}

/////////////////////////////////////////////////////////////
// GitHub Service Class
/////////////////////////////////////////////////////////////

class GitHubService {
  static async commitFile(filePath, commitMessage) {
    console.log(`🔗 Starting GitHub commit for: ${filePath}`);
    
    try {
      // Check if file exists locally
      try {
        await fs.access(filePath);
        console.log(`✅ Local file exists: ${filePath}`);
      } catch (error) {
        console.error(`❌ Local file not found: ${filePath}`);
        return false;
      }

      const fileContent = await fs.readFile(filePath, 'utf8');
      const contentBase64 = Buffer.from(fileContent).toString('base64');
      console.log(`📊 File content size: ${fileContent.length} chars, base64: ${contentBase64.length} chars`);

      let sha;
      try {
        console.log(`🔍 Checking if file exists on GitHub...`);
        const { data } = await octokit.repos.getContent({
          ...GITHUB_CONFIG,
          path: path.basename(filePath),
        });
        sha = data.sha;
        console.log(`✅ File exists on GitHub, SHA: ${sha.substring(0, 8)}...`);
      } catch (err) {
        console.log(`ℹ️ File doesn't exist on GitHub, creating new file`);
        sha = undefined; // File doesn't exist on GitHub
      }

      console.log(`🚀 Creating/updating file on GitHub...`);
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
      console.error("❌ GitHub error details:", err);
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
    console.log(`\n🌐 NEW REQUEST ==================================`);
    console.log(`📨 Request URL: ${req.url}`);
    console.log(`📨 Request Method: ${req.method}`);
    console.log(`📨 Request Headers:`, req.headers);

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`🔍 Parsed URL - Pathname: ${pathname}, Method: ${method}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log(`🔧 CORS headers set`);

    if (method === 'OPTIONS') {
      console.log(`🔄 Handling OPTIONS preflight request`);
      res.writeHead(200).end();
      return;
    }

    console.log(`🛣️ Route: ${method} ${pathname}`);

    try {
      // Route handling - FIXED: Use separate handler methods
      const routes = {
        'GET:/api/data': () => this.handleGetData(req, res),
        'GET:/api/chart/data': () => this.handleGetChartData(req, res),
        'GET:/api/bar/data': () => this.handleGetBarData(req, res),
        'POST:/api/save': () => this.handlePostCSV(req, res, CSV_FILES.data),
        'POST:/api/chart/save': () => this.handlePostChart(req, res),
      };

      const routeKey = `${method}:${pathname}`;
      console.log(`🔍 Looking for route: ${routeKey}`);
      
      const routeHandler = routes[routeKey];
      if (routeHandler) {
        console.log(`✅ Route found, executing handler`);
        await routeHandler();
      } else {
        console.log(`❌ Route not found, trying static files`);
        await this.handleStaticFiles(req, res, pathname);
      }
    } catch (error) {
      console.error(`💥 Unhandled error in request handler:`, error);
      this.sendError(res, 500, error.message);
    }
    
    console.log(`✅ REQUEST COMPLETED =============================\n`);
  }

  // Separate handler methods for each route
  static async handleGetData(req, res) {
    try {
      console.log("📊 Handling GET /api/data");
      const data = await CSVManager.readCSV(CSV_FILES.data);
      console.log(`✅ Sending ${data.length} rows of data`);
      this.sendJson(res, 200, { success: true, data });
    } catch (error) {
      console.error(`❌ Error in handleGetData:`, error);
      this.sendError(res, 500, `Failed to read data CSV: ${error.message}`);
    }
  }

  static async handleGetChartData(req, res) {
    try {
      console.log("📈 Handling GET /api/chart/data");
      const data = await CSVManager.readCSV(CSV_FILES.chart);
      console.log(`✅ Sending ${data.length} rows of chart data`);
      this.sendJson(res, 200, { success: true, data });
    } catch (error) {
      console.error(`❌ Error in handleGetChartData:`, error);
      this.sendError(res, 500, `Failed to read chart CSV: ${error.message}`);
    }
  }

  static async handleGetBarData(req, res) {
    try {
      console.log("📊 Handling GET /api/bar/data");
      const data = await CSVManager.readCSV(CSV_FILES.bar);
      console.log(`✅ Sending ${data.length} rows of bar data`);
      this.sendJson(res, 200, { success: true, data });
    } catch (error) {
      console.error(`❌ Error in handleGetBarData:`, error);
      this.sendError(res, 500, `Failed to read bar CSV: ${error.message}`);
    }
  }

  static async handlePostCSV(req, res, filePath) {
    console.log(`💾 Handling POST CSV request for: ${filePath}`);
    
    try {
      const body = await this.parseRequestBody(req);
      console.log(`📨 Received request body:`, body);
      
      const { data } = body;

      if (!Array.isArray(data)) {
        console.error(`❌ Invalid data format, expected array, got:`, typeof data);
        throw new Error('Data must be an array');
      }

      console.log(`✅ Data validation passed, ${data.length} rows to append`);
      
      await CSVManager.appendCSV(filePath, data);
      console.log(`✅ Data appended to CSV`);
      
      await GitHubService.commitFile(filePath, `Update ${path.basename(filePath)} via server`);
      console.log(`✅ GitHub commit completed`);
      
      this.sendJson(res, 200, { success: true, message: 'Data saved successfully' });
    } catch (error) {
      console.error(`❌ Error in handlePostCSV:`, error);
      this.sendError(res, 500, `Failed to save data: ${error.message}`);
    }
  }

  static async handlePostChart(req, res) {
    console.log(`📈 Handling POST Chart request`);
    
    try {
      const body = await this.parseRequestBody(req);
      console.log(`📨 Received chart data request body:`, body);
      
      const { csvData } = body;

      if (typeof csvData !== 'string') {
        console.error(`❌ Invalid csvData format, expected string, got:`, typeof csvData);
        throw new Error('csvData must be a string');
      }

      console.log(`✅ Chart data validation passed, ${csvData.length} chars to write`);
      
      await fs.writeFile(CSV_FILES.chart, csvData, 'utf8');
      console.log(`✅ Chart data written to file`);
      
      await GitHubService.commitFile(CSV_FILES.chart, 'Update chart data via server');
      console.log(`✅ GitHub commit for chart completed`);
      
      this.sendJson(res, 200, { success: true, message: 'Chart data saved successfully' });
    } catch (error) {
      console.error(`❌ Error in handlePostChart:`, error);
      this.sendError(res, 500, `Failed to save chart data: ${error.message}`);
    }
  }

  static async handleStaticFiles(req, res, pathname) {
    console.log(`📁 Handling static file request for: ${pathname}`);
    
    const staticFiles = {
      '/': 'index.html',
      '/index.html': 'index.html',
      '/style.css': 'style.css',
      '/main.js': 'main.js'
    };

    const file = staticFiles[pathname];
    console.log(`🔍 Static file lookup: ${pathname} -> ${file}`);
    
    if (file) {
      try {
        const filePath = path.join(process.cwd(), file);
        console.log(`📖 Reading static file: ${filePath}`);
        
        const content = await fs.readFile(filePath, 'utf8');
        const contentType = this.getContentType(file);
        
        console.log(`✅ Static file found, sending ${content.length} chars with content-type: ${contentType}`);
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (error) {
        console.error(`❌ Error reading static file:`, error);
        this.sendError(res, 404, `${file} not found`);
      }
    } else {
      console.log(`❌ Static file not found: ${pathname}`);
      this.sendError(res, 404, 'Not found');
    }
  }
  
  static async parseRequestBody(req) {
    console.log(`📨 Parsing request body...`);
    
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        console.log(`📨 Received ${chunk.length} bytes of data`);
      });
      req.on('end', () => {
        console.log(`📨 Request body complete: ${body.length} chars total`);
        try {
          const parsed = body ? JSON.parse(body) : {};
          console.log(`✅ Successfully parsed JSON request body`);
          resolve(parsed);
        } catch (error) {
          console.error(`❌ Failed to parse JSON:`, error);
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', (error) => {
        console.error(`❌ Request stream error:`, error);
        reject(error);
      });
    });
  }

  static sendJson(res, statusCode, data) {
    console.log(`📤 Sending JSON response - Status: ${statusCode}, Data:`, data);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  static sendError(res, statusCode, message) {
    console.error(`🚨 Sending error response - Status: ${statusCode}, Message: ${message}`);
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
    const contentType = types[ext] || 'text/plain';
    console.log(`🔍 Content type for ${filename}: ${contentType}`);
    return contentType;
  }
}

// Server Initialization
async function initializeServer() {
  console.log(`🚀 Initializing server...`);
  
  // Initialize CSV files if they don't exist
  console.log(`📁 Checking CSV files...`);
  for (const [key, filePath] of Object.entries(CSV_FILES)) {
    try {
      await fs.access(filePath);
      console.log(`✅ ${key} CSV file exists: ${filePath}`);
      
      // Log file stats
      const stats = await fs.stat(filePath);
      console.log(`   📊 File size: ${stats.size} bytes`);
      
    } catch (error) {
      console.log(`❌ ${key} CSV file not found, creating: ${filePath}`);
      const sampleData = key === 'data' 
        ? `Name,Age,City\nJohn Doe,30,New York\nJane Smith,25,London`
        : key === 'chart'
        ? `Month,Year,Reason,Value\nJan,2024,Salary,1000\nFeb,2024,Salary,1200`
        : `Description,Cost\nRent,800\nFood,300\nTransport,150`;
      await fs.writeFile(filePath, sampleData);
      console.log(`📁 Created ${key} CSV file with sample data`);
    }
  }

  console.log(`🌐 Creating HTTP server...`);
  const server = http.createServer((req, res) => {
    console.log(`🔗 New connection from: ${req.socket.remoteAddress}`);
    RequestHandler.handleRequest(req, res);
  });
  
  server.listen(PORT, () => {
    console.log(`🎉 Server running on port ${PORT}`);
    console.log(`📊 CSV files: ${Object.values(CSV_FILES).map(f => path.basename(f)).join(', ')}`);
    console.log(`🌍 Server should be accessible at: http://localhost:${PORT}`);
    console.log(`🔍 Try these test endpoints:`);
    console.log(`   - http://localhost:${PORT}/api/data`);
    console.log(`   - http://localhost:${PORT}/api/chart/data`);
    console.log(`   - http://localhost:${PORT}/api/bar/data`);
    console.log(`   - http://localhost:${PORT}/`);
  });

  server.on('error', (error) => {
    console.error(`💥 Server error:`, error);
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} busy, trying ${Number(PORT) + 1}...`);
      server.listen(Number(PORT) + 1);
    } else {
      console.error('❌ Server error:', error);
    }
  });

  server.on('close', () => {
    console.log('🔒 Server closed');
  });

  server.on('connection', (socket) => {
    console.log(`🔗 New client connected: ${socket.remoteAddress}`);
  });

  return server;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM - Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT - Server interrupted');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
console.log(`🔧 Starting application...`);
initializeServer().catch(error => {
  console.error('💥 Failed to initialize server:', error);
  process.exit(1);
});