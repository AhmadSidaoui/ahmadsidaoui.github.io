const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Github Access
const { Octokit } = require("@octokit/rest");
// Access GitHub token from environment variable
const GITHUB_TOKEN = process.env.GITHUB_ACCESSTOKEN;
if (!GITHUB_TOKEN) {
    console.error("❌ GitHub token not found in environment variables!");
    process.exit(1);
}
const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function commitCSVToGitHub(filePath, repoOwner, repoName, commitMessage) {
    try {
        // Read file content
        const fileContent = await fs.readFile(filePath, 'utf8');

        // Convert content to base64
        const contentBase64 = Buffer.from(fileContent).toString('base64');

        // Get current file SHA (required for updating existing file)
        let sha;
        try {
            const { data } = await octokit.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: filePath,
            });
            sha = data.sha;
        } catch (err) {
            // File does not exist, that's fine
            sha = undefined;
        }

        // Create or update file
        await octokit.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: filePath,
            message: commitMessage,
            content: contentBase64,
            sha, // include SHA only if updating
        });

        console.log(`✅ File ${filePath} committed to GitHub successfully`);
    } catch (err) {
        console.error("❌ Failed to commit to GitHub:", err.message);
    }
}


// create the port
const PORT = process.env.PORT || 3000;  // to deploy it on render

// the csv file acting as a Database
const CSV_FILE = 'backend/DocumentTraker.csv';
const CHART_CSV = 'backend/savings_data.csv';

// Initialize CSV file with sample data
async function initializeCSV() {
    try {
        // fetch the file
        await fs.access(CSV_FILE);

        //log
        console.log('CSV file exists ✅');
    } catch (error) {
        // initialize the file if id dies not exist
        const initialData = `Name,Age,City
        John Doe,30,New York
        Jane Smith,25,London`;

        // write to csv file the initialized data
        await fs.writeFile(CSV_FILE, initialData);

        // log
        console.log('Created new CSV file with sample data 📁');
    }
}

// Read CSV file
async function readCSV(file) {
    try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.trim().split('\n');
        
        if (lines.length === 0) return [];
        
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Write to CSV file
async function writeCSV(file, data) {
    try {
        if (data.length === 0) {
            await fs.writeFile(file, '');
            return;
        }

        const headers = Object.keys(data[0]);
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => row[header] || '');
            csvContent += values.join(',') + '\n';
        });
        
        await fs.writeFile(CSV_FILE, csvContent);
    } catch (error) {
        throw error;
    }
}

// Server request handler
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`Request: ${req.method} ${pathname}`);

    // API routes - handle these first
    if (pathname === '/api/data' && req.method === 'GET') {
        try {
            const data = await readCSV(CSV_FILE);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: data }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
        return;
    }

    if (pathname === '/api/chart/data' && req.method === 'GET') {
        try {
            const data = await readCSV(CHART_CSV);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: data }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
        return;
    }

    if (pathname === '/api/save' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const { data } = JSON.parse(body);
                await writeCSV(CSV_FILE, data);
                await commitCSVToGitHub(CHART_CSV, 'AhmadSidaoui', 'ahmadsidaoui.github.io', 'Update CSV via server');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Data saved successfully' }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });

        return;
    }

    if (pathname === '/api/chart/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { csvData } = JSON.parse(body);
                await fs.writeFile(CHART_CSV, csvData, 'utf8');
                await commitCSVToGitHub(CHART_CSV, 'AhmadSidaoui', 'ahmadsidaoui.github.io', 'Update CSV via server');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Data saved successfully' }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });


        return;
    }


    // Serve static files
    if (pathname === '/' || pathname === '../index.html') {
        try {
            const content = await fs.readFile('index.html', 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
            return;
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('index.html not found');
            return;
        }
    }
    
    if (pathname === '../style.css') {
        try {
            const content = await fs.readFile('style.css', 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(content);
            return;
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('style.css not found');
            return;
        }
    }

    if (pathname === '../main.js') {
        try {
            const content = await fs.readFile('main.js', 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(content);
            return;
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('script.js not found');
            return;
        }
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
}

// Create and start server
async function startServer() {
    await initializeCSV();
    
    const server = http.createServer(handleRequest);
    
    server.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
        console.log(`📁 CSV file: ${CSV_FILE}`);
        console.log('🛑 Press Ctrl+C to stop the server');
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`❌ Port ${PORT} is already in use. Please use a different port.`);
            process.exit(1);
        }
    });
}

startServer().catch(console.error);