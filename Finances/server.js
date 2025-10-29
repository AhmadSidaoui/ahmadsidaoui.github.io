const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CSV_FILE = 'savings_data.csv';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Read CSV file
async function readCSV() {
    try {
        const data = await fs.readFile(CSV_FILE, 'utf8');
        return data;
    } catch (error) {
        // If file doesn't exist, create with header
        const header = 'Month,Reason,Value\n';
        await fs.writeFile(CSV_FILE, header);
        return header;
    }
}

// Write CSV file
async function writeCSV(csvData) {
    await fs.writeFile(CSV_FILE, csvData);
}

// Routes
app.get('/api/data', async (req, res) => {
    try {
        const csvData = await readCSV();
        res.json({ success: true, data: csvData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const { csvData } = req.body;
        if (!csvData) {
            return res.status(400).json({ success: false, error: 'No data provided' });
        }
        
        await writeCSV(csvData);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`CSV file: ${CSV_FILE}`);
});