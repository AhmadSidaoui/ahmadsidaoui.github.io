// Global variables for data management
let monthlyData = {};
let currentEditingMonth = null;
let chart;

// Backend API URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    initializeEventListeners();
});

// Load data from CSV file via backend API
async function loadCSVData() {
    try {
        const response = await fetch(`${API_BASE_URL}/data`);
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
function processCSVData(csvText) {
    monthlyData = {};
    
    // Split CSV into lines and process each line
    const lines = csvText.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
        // Skip header row if it exists
        if (index === 0 && (line.includes('Month') || line.includes('month') || line.includes('Reason') || line.includes('Value'))) {
            return;
        }
        
        const [month, reason, value] = line.split(',').map(item => item.trim());
        
        if (month && reason && value && !isNaN(value)) {
            if (!monthlyData[month]) {
                monthlyData[month] = [];
            }
            
            monthlyData[month].push({ 
                reason: reason, 
                value: parseInt(value) 
            });
        }
    });
}

// Save data back to CSV file via backend API
async function saveToCSV() {
    const csvLines = [];
    
    // Add header
    csvLines.push('Month,Reason,Value');
    
    // Add data rows
    Object.keys(monthlyData).sort().forEach(month => {
        monthlyData[month].forEach(entry => {
            csvLines.push(`${month},${entry.reason},${entry.value}`);
        });
    });
    
    const csvContent = csvLines.join('\n');
    
    try {
        const response = await fetch(`${API_BASE_URL}/data`, {
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
    const months = Object.keys(monthlyData).sort();
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
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
    const months = Object.keys(monthlyData).sort();
    const monthlyTotals = months.map(month => {
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
    saveToCSV();
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
    chart.data.labels = Object.keys(monthlyData).sort();
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
    
    if (monthlyElement && currentElement) {
        const months = Object.keys(monthlyData).sort();
        if (months.length === 0) return;
        
        const latestMonth = months[months.length - 1];
        const monthlyVal = calculateCurrentMonthTotal(latestMonth) + Math.floor(Math.random() * 100);
        const cumulativeTotals = calculateMonthlyTotals();
        const currentVal = cumulativeTotals[cumulativeTotals.length - 1] + Math.floor(Math.random() * 50);
        
        monthlyElement.textContent = monthlyVal + ' Eur';
        currentElement.textContent = currentVal + ' Eur';
    }
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
    const widget = btn.closest('.card, .chart-section, .clock-widget, .todo-widget');
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