const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, "timestamps.csv");

app.use(cors());
app.use(bodyParser.json());

// Helper to read CSV
function readCSV() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const data = fs.readFileSync(CSV_FILE, "utf8");
  return data
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, time, date] = line.split(",");
      return { id: parseInt(id), time: parseFloat(time), date };
    });
}


// Helper to write CSV
function writeCSV(data) {
  const csv = "id,time,date\n" + data.map((d) => `${d.id},${d.time},${d.date}`).join("\n");
  fs.writeFileSync(CSV_FILE, csv, "utf8");
}


// Get all timestamps
app.get("/timestamps", (req, res) => {
  res.json(readCSV());
});

// Add a timestamp
// Add a timestamp
app.post("/timestamps", (req, res) => {
  const { time } = req.body;
  const data = readCSV();
  const id = data.length ? data[data.length - 1].id + 1 : 1;

  const date = new Date().toISOString(); // ISO format timestamp
  data.push({ id, time, date });
  writeCSV(data);
  res.json({ success: true, id, time, date });
});


// Delete a timestamp
app.delete("/timestamps/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let data = readCSV();
  data = data.filter((t) => t.id !== id);
  writeCSV(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
