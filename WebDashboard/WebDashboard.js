// Global variables for data management
let monthlyData = {};
let currentEditingMonth = null;
let chart;

// Backend API URL
// const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://ahmadsidaoui-github-io.onrender.com/api';



// Load data from CSV file via backend API
async function loadCSVData1() {
    try {
        const response = await fetch(`${API_BASE_URL}/chart/data`);
        const result = await response.json();
        
        if (result.success) {
            processCSVData(result.data);
            initializeChart();
            updateSavingsDisplay();
        } else {
            throw new Error(result.error || 'Failed to load CSV data');
        }
    } catch (error) {
        console.warn('Error loading data:', error.message);
        // Initialize with empty data structure
        monthlyData = {};
        initializeChart();
        updateSavingsDisplay();
        
        // Show error to user
        if (error.message.includes('Failed to fetch')) {
            alert('Cannot connect to server. Make sure server.js is running on port 3000.');
        }
    }
}

// Process CSV data and convert to monthlyData format
function processCSVData(dataArray) {
    monthlyData = {};

    dataArray.forEach(item => {
        const month = item.Month?.trim();          // e.g., "Dec"
        const year = item.Year?.trim();          // year is actually in Reason
        const key = `${month} ${year}`;            // month + year key
        const reason = item.Reason;

        // The actual value is in Value\r, but currently it's "sal" as a placeholder
        // If you eventually have numeric values, parse them here
        const valueRaw = item['Value\r'] ?? item.Value ?? 0;
        const value = Number(String(valueRaw).trim()) || 0; // fallback to 0 if NaN

        if (!monthlyData[key]) monthlyData[key] = [];
        monthlyData[key].push({ reason: reason , value }); // reason can be hardcoded if not in CSV
    });

    console.log("Processed monthlyData:", monthlyData);
}

const monthOrder = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };

function getSortedMonths() {
    return Object.keys(monthlyData).sort((a,b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        if (Number(yearA) !== Number(yearB)) return Number(yearA) - Number(yearB);
        return monthOrder[monthA] - monthOrder[monthB];
    });
}



// Save data back to CSV file via backend API
async function saveToCSV() {
    const csvLines = [];
    
    // Add header
    csvLines.push('Month,Year,Reason,Value');
    
    // Month order map for proper sorting
    const monthOrder = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    
    // Sort months chronologically by year and month
    const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        if (Number(yearA) !== Number(yearB)) return Number(yearA) - Number(yearB);
        return monthOrder[monthA] - monthOrder[monthB];
    });
    
    // Add data rows
    sortedKeys.forEach(key => {
        const [month, year] = key.split(' ');
        monthlyData[key].forEach(entry => {
            csvLines.push(`${month},${year},${entry.reason},${entry.value}`);
        });
    });
    
    const csvContent = csvLines.join('\n');
    
    try {
        const response = await fetch(`${API_BASE_URL}/chart/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ csvData: csvContent })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to save data');
        }
        
        console.log('Data saved successfully to CSV file');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data to server: ' + error.message);
    }
}


// The rest of your existing functions remain the same...
function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const sortedMonths = getSortedMonths();
    if (chart) {
        chart.destroy();
    }


    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Cumulative Savings',
                data: calculateMonthlyTotals(),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-light'),
                tension: 0.4,
                fill: true,
                pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cumulative Amount (Eur)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const elementIndex = elements[0].index;
                    const month = chart.data.labels[elementIndex];
                    openDataModal(month);
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const month = context.label;
                            const cumulativeTotal = context.parsed.y;
                            const currentMonthTotal = calculateCurrentMonthTotal(month);
                            return `Cumulative: ${cumulativeTotal} Eur | This Month: ${currentMonthTotal} Eur`;
                        },
                        afterLabel: function(context) {
                            const month = context.label;
                            const details = monthlyData[month];
                            if (details && details.length > 0) {
                                return ['Breakdown:'].concat(details.map(item => `  ${item.reason}: ${item.value} Eur`)).join('\n');
                            }
                            return '';
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeEventListeners() {
    // Theme Switcher
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.body.dataset.theme = theme;
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateChartColors();
        });
    });

    // Close modal on outside click
    document.getElementById('dataModal').addEventListener('click', (e) => {
        if (e.target.id === 'dataModal') {
            closeDataModal();
        }
    });

    document.getElementById('widgetLibrary').addEventListener('click', (e) => {
        if (e.target.id === 'widgetLibrary') {
            closeWidgetLibrary();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('dataModal').classList.contains('active')) {
            closeDataModal();
        }
    });
}

// Calculate cumulative monthly totals from detailed data
function calculateMonthlyTotals() {
    const sortedMonths = getSortedMonths(); // ensure proper month-year order
    const monthlyTotals = sortedMonths.map(month => {
        return monthlyData[month].reduce((total, item) => total + item.value, 0);
    });

    return calculateCumulativeTotals(monthlyTotals);
}


// Calculate cumulative totals (each month adds to previous)
function calculateCumulativeTotals(monthlyTotals) {
    const cumulativeTotals = [];
    let runningTotal = 0;
    
    monthlyTotals.forEach(total => {
        runningTotal += total;
        cumulativeTotals.push(runningTotal);
    });
    
    return cumulativeTotals;
}

// Calculate just the current month's total (non-cumulative)
function calculateCurrentMonthTotal(month) {
    return monthlyData[month] ? monthlyData[month].reduce((total, item) => total + item.value, 0) : 0;
}

// Calculate cumulative total up to a specific month
function calculateCumulativeTotalUpTo(month) {
    const months = Object.keys(monthlyData).sort();
    const targetIndex = months.indexOf(month);
    let cumulativeTotal = 0;
    
    for (let i = 0; i <= targetIndex; i++) {
        cumulativeTotal += calculateCurrentMonthTotal(months[i]);
    }
    
    return cumulativeTotal;
}

// Open data modal
function openDataModal(month) {
    currentEditingMonth = month;
    const currentMonthTotal = calculateCurrentMonthTotal(month);
    const cumulativeTotal = calculateCumulativeTotalUpTo(month);
    
    document.getElementById('modalMonth').textContent = 
        `${month} Details - This Month: ${currentMonthTotal} Eur | Cumulative: ${cumulativeTotal} Eur`;
    
    populateDataTable(month);
    document.getElementById('dataModal').classList.add('active');
    highlightChartPoint(month);
}

// Close data modal
function closeDataModal() {
    document.getElementById('dataModal').classList.remove('active');
    currentEditingMonth = null;
    clearInputs();
    removeChartHighlight();
}

// Populate data table
function populateDataTable(month) {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';
    
    if (!monthlyData[month]) {
        monthlyData[month] = [];
    }
    
    monthlyData[month].forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${item.reason}" onchange="updateDataField(${index}, 'reason', this.value)" class="reason-edit"></td>
            <td><input type="number" value="${item.value}" onchange="updateDataField(${index}, 'value', parseInt(this.value))" class="value-edit"></td>
            <td><button onclick="deleteDataRow(${index})" class="delete-row">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new data row
function addDataRow() {
    const reasonInput = document.getElementById('reasonInput');
    const valueInput = document.getElementById('valueInput');
    
    const reason = reasonInput.value.trim();
    const value = parseInt(valueInput.value);
    
    if (!reason || isNaN(value)) {
        alert('Please enter both reason and value');
        return;
    }
    
    if (!monthlyData[currentEditingMonth]) {
        monthlyData[currentEditingMonth] = [];
    }
    
    monthlyData[currentEditingMonth].push({ reason, value });
    populateDataTable(currentEditingMonth);
    clearInputs();
    // saveToCSV();
}

// Delete data row
function deleteDataRow(index) {
    monthlyData[currentEditingMonth].splice(index, 1);
    populateDataTable(currentEditingMonth);
    saveToCSV();
}

// Update data field
function updateDataField(index, field, value) {
    monthlyData[currentEditingMonth][index][field] = value;
    saveToCSV();
}

// Clear input fields
function clearInputs() {
    document.getElementById('reasonInput').value = '';
    document.getElementById('valueInput').value = '';
}

// Save month data and update chart
function saveMonthData() {
    chart.data.labels = getSortedMonths();
    chart.data.datasets[0].data = calculateMonthlyTotals();
    chart.update();
    updateSavingsDisplay();
    saveToCSV();
    closeDataModal();
}

// Update the savings display cards
function updateSavingsDisplay() {
    const monthlyElement = document.getElementById('monthlySavings');
    const currentElement = document.getElementById('currentSavings');
    
    if (monthlyElement && currentElement) {
        const months = Object.keys(monthlyData).sort();
        if (months.length === 0) {
            monthlyElement.textContent = '0 Eur';
            currentElement.textContent = '0 Eur';
            return;
        }
        
        const latestMonth = months[months.length - 1];
        const monthlyVal = calculateCurrentMonthTotal(latestMonth);
        const cumulativeTotals = calculateMonthlyTotals();
        const currentVal = cumulativeTotals[cumulativeTotals.length - 1];
        
        monthlyElement.textContent = monthlyVal + ' Eur';
        currentElement.textContent = currentVal + ' Eur';
    }
}

// Update chart colors when theme changes
function updateChartColors() {
    if (chart) {
        chart.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        chart.data.datasets[0].backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-light');
        chart.data.datasets[0].pointBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        chart.update();
    }
}

// Highlight chart point
function highlightChartPoint(month) {
    const monthIndex = chart.data.labels.indexOf(month);
    chart.data.datasets[0].pointBackgroundColor = chart.data.labels.map((label, index) => 
        index === monthIndex ? getComputedStyle(document.documentElement).getPropertyValue('--accent-color') : getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
    );
    chart.data.datasets[0].pointRadius = chart.data.labels.map((label, index) => 
        index === monthIndex ? 8 : 6
    );
    chart.update();
}

// Remove chart highlight
function removeChartHighlight() {
    chart.data.datasets[0].pointBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    chart.data.datasets[0].pointRadius = 6;
    chart.update();
}

// Real-time updates simulation
function updateSavings() {
    const monthlyElement = document.getElementById('monthlySavings');
    const currentElement = document.getElementById('currentSavings');
    
        monthlyElement.textContent = `1300` + ' Eur';
        currentElement.textContent = `0` + ' Eur';
}

// Update every 5 seconds
setInterval(updateSavings, 5000);

// Widget Library Functions (keep your existing widget functions)
function openWidgetLibrary() {
    document.getElementById('widgetLibrary').classList.add('active');
}

function closeWidgetLibrary() {
    document.getElementById('widgetLibrary').classList.remove('active');
}

function deleteWidget(btn) {
    const widget = btn.closest('.card, .chart-section, .clock-widget, .todo-widget, .table-section');
    widget.style.opacity = '0';
    widget.style.transform = 'scale(0.8)';
    setTimeout(() => widget.remove(), 300);
}

function addWidget(type) {
    const container = document.getElementById('widgetsContainer');
    let widgetHTML = '';
    
    switch(type) {
        case 'clock':
            widgetHTML = `
                <div class="card clock-widget">
                    <button class="delete-widget" onclick="deleteWidget(this)">
                        <i class="bi bi-x"></i>
                    </button>
                    <h2 class="clock-time" id="clockTime">00:00:00</h2>
                    <p class="clock-date" id="clockDate">Monday, January 1, 2024</p>
                </div>
            `;
            break;
        case 'todo':
            widgetHTML = `
                <div class="card todo-widget">
                    <button class="delete-widget" onclick="deleteWidget(this)">
                        <i class="bi bi-x"></i>
                    </button>
                    <h3><i class="bi bi-check2-square"></i> Todo List</h3>
                    <div class="todo-input-container">
                        <input type="text" class="todo-input" placeholder="Add a task..." onkeypress="if(event.key==='Enter') addTodo(this)">
                        <button class="todo-add-btn" onclick="addTodo(this.previousElementSibling)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                    <ul class="todo-list"></ul>
                </div>
            `;
            break;
        case 'counter':
            widgetHTML = `
                <div class="card">
                    <button class="delete-widget" onclick="deleteWidget(this)">
                        <i class="bi bi-x"></i>
                    </button>
                    <i class="bi bi-123"></i>
                    <h3 class="counter-value">0</h3>
                    <p>Counter</p>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                        <button onclick="updateCounter(this, -1)" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">-</button>
                        <button onclick="updateCounter(this, 1)" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">+</button>
                    </div>
                </div>
            `;
            break;
        case 'progress':
            widgetHTML = `
                <div class="card">
                    <button class="delete-widget" onclick="deleteWidget(this)">
                        <i class="bi bi-x"></i>
                    </button>
                    <i class="bi bi-bar-chart"></i>
                    <h3>75%</h3>
                    <p>Goal Progress</p>
                    <div style="background: var(--bg-primary); height: 10px; border-radius: 5px; overflow: hidden; margin-top: 1rem;">
                        <div style="background: var(--accent-color); height: 100%; width: 75%; transition: width 0.5s;"></div>
                    </div>
                </div>
            `;
            break;
        case 'notes':
            widgetHTML = `
                <div class="card" style="text-align: left;">
                    <button class="delete-widget" onclick="deleteWidget(this)">
                        <i class="bi bi-x"></i>
                    </button>
                    <h3><i class="bi bi-journal-text"></i> Quick Notes</h3>
                    <textarea style="width: 100%; min-height: 100px; padding: 0.75rem; border: 2px solid var(--accent-light); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-family: inherit; resize: vertical;" placeholder="Write your notes here..."></textarea>
                </div>
            `;
            break;
        case 'stats':
            widgetHTML = `
                <div class="card">
                    <button class="delete-widget" onclick="deleteWidget(this)">
                        <i class="bi bi-x"></i>
                    </button>
                    <i class="bi bi-graph-up-arrow"></i>
                    <h3 id="randomStat">${Math.floor(Math.random() * 1000)}</h3>
                    <p>Random Stat</p>
                </div>
            `;
            break;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = widgetHTML;
    const widget = tempDiv.firstElementChild;
    widget.style.opacity = '0';
    widget.style.transform = 'scale(0.8)';
    
    container.appendChild(widget);
    
    setTimeout(() => {
        widget.style.opacity = '1';
        widget.style.transform = 'scale(1)';
    }, 10);
    
    if (type === 'clock') {
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    closeWidgetLibrary();
}

function updateClock() {
    const clockTime = document.getElementById('clockTime');
    const clockDate = document.getElementById('clockDate');
    if (clockTime && clockDate) {
        const now = new Date();
        clockTime.textContent = now.toLocaleTimeString();
        clockDate.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

function addTodo(input) {
    const text = input.value.trim();
    if (!text) return;
    
    const list = input.closest('.todo-widget').querySelector('.todo-list');
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = `
        <input type="checkbox" onchange="this.parentElement.classList.toggle('completed')">
        <span>${text}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer;">
            <i class="bi bi-trash"></i>
        </button>
    `;
    list.appendChild(li);
    input.value = '';
}

function updateCounter(btn, change) {
    const counter = btn.closest('.card').querySelector('.counter-value');
    const currentValue = parseInt(counter.textContent);
    counter.textContent = currentValue + change;
}




































class DocumentTracker {
  constructor() {
    this.table = document.getElementById("tableCSV");
    this.tableHeader = document.getElementById("tableHeader");
    this.tableBody = document.getElementById("tableBody");
    this.messageDiv = document.getElementById("message");
    this.hasUnsavedChanges = false;
    this.isLoading = false;

    this.initializeEventListeners();
    this.loadCSVData();
  }

  initializeEventListeners() {

    this.tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains(`table-action-btn`)) {
        this.toggleRow(e.target);
      }
    });
  }

  async loadCSVData() {

    if (this.isLoading) return;

    this.isLoading = true;
    try {
      console.log("Loading CSV data...");
      const response = await fetch(API_BASE_URL + "/data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (data.success) {
        this.renderTable(data.data);
        this.hasUnsavedChanges = false;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  renderTable(data) {
    // Clear existing table
    // the table header is pointed at in the constructor of this class
    this.tableHeader.innerHTML = "";
    this.tableBody.innerHTML = "";

    if (data.length === 0) {
      this.showMessage("No data found in CSV file", "info");
      // Create empty table with headers if no data
      // this.createEmptyTable();
      return;
    }

    // Create header row
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    });

    // Add action column header
    const actionTh = document.createElement("th");
    actionTh.textContent = "Actions";
    headerRow.appendChild(actionTh);

    this.tableHeader.appendChild(headerRow);

    // Create data rows
    data.forEach((row, index) => {
      this.createTableRow(row);
    });
  }

  createTableRow(rowData) {
    const tr = document.createElement("tr");

    Object.values(rowData).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    // Apply initial styling based on the second cell (status)
    const secondCell = tr.cells[1]; // second column
    if (
      secondCell &&
      secondCell.textContent.trim().toLowerCase() === "completed"
    ) {
      tr.style.backgroundColor = "lightgreen"; // highlight row
      Array.from(tr.cells).forEach((cell) => (cell.style.fontWeight = "bold")); // bold text
    }

    // Add toggle button  ---> we are appending the buttong at the end
    const actionTd = document.createElement("td");
    const togglebtn = document.createElement("button");
    togglebtn.type = "button";
    togglebtn.textContent = "Toggle";
    togglebtn.className = `table-action-btn`; //'delete-row';
    actionTd.appendChild(togglebtn);
    tr.appendChild(actionTd);

    this.tableBody.appendChild(tr);
    return tr;
  }

 toggleRow(button) {
    console.log("🟡 toggleRow called");
    
    const row = button.closest("tr");
    const secondCell = row.cells[1];

    if (!secondCell) return;

    const currentStatus = secondCell.textContent.trim().toLowerCase();

    if (currentStatus === "completed") {
      secondCell.textContent = "Pending";
      row.style.backgroundColor = "";
      Array.from(row.cells).forEach((cell) => {
        cell.style.fontWeight = "normal";
      });
    } else {
      secondCell.textContent = "Completed";
      row.style.backgroundColor = "lightgreen";
      Array.from(row.cells).forEach((cell) => {
        cell.style.fontWeight = "bold";
      });
    }

    this.hasUnsavedChanges = true;

    console.log("🟡 About to call saveChanges");
    this.saveChanges();
    console.log("🟡 saveChanges returned");
    }

  async saveChanges(event) {
    console.log("🔵 saveChanges called");

    try {
      console.log("🔵 Building data...");
      const headers = Array.from(this.tableHeader.querySelectorAll("th"))
        .map((th) => th.textContent)
        .filter((header) => header !== "Actions");

      const data = [];
      const rows = this.tableBody.querySelectorAll("tr");

      rows.forEach((row) => {
        const rowData = {};
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
          if (headers[index]) {
            rowData[headers[index]] = cell.textContent.trim();
          }
        });

        if (Object.values(rowData).some((value) => value !== "")) {
          data.push(rowData);
        }
      });

      console.log("🔵 Sending fetch request...");
      const response = await fetch(API_BASE_URL + "/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: data }),
      });

      console.log("🔵 Fetch response received:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log("🔵 Save completed successfully");
      this.hasUnsavedChanges = false;
      
    } catch (error) {
      console.error("🔵 Error saving data:", error);
    }
    
    console.log("🔵 saveChanges function finished");
}


}


// Initialize the editor when the page loads
let documentTracker;
documentTracker = new DocumentTracker();

document.addEventListener('DOMContentLoaded', () => {
        initializeEventListeners() 
        loadCSVData1()
        loadChartData();
});




























async function loadChartData() {
  try {
    // Fetch your data from the API
    const response = await fetch(API_BASE_URL + "/bar/data");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("API returned success: false");
    }

    // Assuming API returns something like:
    // { success: true, data: [ { name: "IELTS", cost: 250 }, { name: "ECA", cost: 200 }, ... ] }

    const labels = result.data.map(item => item.Description);
    const values = result.data.map(item => item.Cost);

    renderBudgetChart(labels, values);

  } catch (error) {
    console.error("Error loading chart data:", error);
  }
}

function renderBudgetChart(labels, values) {
  const ctx = document.getElementById('budgetChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cost (USD)',
        data: values,
        borderRadius: 10,
        backgroundColor: [
          'rgba(37, 99, 235, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(147, 197, 253, 0.9)'
        ],
        hoverBackgroundColor: [
          'rgba(37, 99, 235, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 197, 253, 1)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6b7280' }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#f0f6ff' },
          ticks: { color: '#6b7280', stepSize: 50 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(37,99,235,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderWidth: 0,
          padding: 8
        }
      }
    }
  });
}

// Call it when the page loads

























    /* ---------- Timeline Interactivity ---------- */
(function(){
    const steps = Array.from(document.querySelectorAll('.timeline-step'));
    const progress = document.getElementById('timelineProgress');
    const wrapper = document.getElementById('timelineWrapper');

    function isVertical(){ return window.matchMedia('(max-width:720px)').matches; }

    function setStep(stepIndex){
    steps.forEach((s, idx) => {
        s.classList.remove('active','completed');
        if(idx < stepIndex - 1) s.classList.add('completed');
        else if(idx === stepIndex - 1) s.classList.add('active');
    });

    const target = steps[stepIndex - 1];
    const barRect = wrapper.querySelector('.timeline-bar').getBoundingClientRect();
    const targetDot = target.querySelector('.dot').getBoundingClientRect();

    if(isVertical()){
        const barTop = barRect.top;
        const barHeight = barRect.height || 1;
        const centerY = (targetDot.top + targetDot.bottom) / 2;
        const filled = Math.max(0, Math.min(1, (centerY - barTop) / barHeight));
        progress.style.height = (filled * 100).toFixed(2) + '%';
    } else {
        const barLeft = barRect.left;
        const barWidth = barRect.width || 1;
        const centerX = (targetDot.left + targetDot.right) / 2;
        const filled = Math.max(0, Math.min(1, (centerX - barLeft) / barWidth));
        progress.style.width = (filled * 100).toFixed(2) + '%';
    }
    }

    steps.forEach(s => s.addEventListener('click', () => setStep(+s.dataset.step)));
    window.addEventListener('resize', () => {
    const active = steps.findIndex(s => s.classList.contains('active'));
    setStep(active >= 0 ? active + 1 : 1);
    });

    setStep(1);
})();


