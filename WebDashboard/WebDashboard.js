// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================
class Config {
  static API_BASE_URL = 'https://ahmadsidaoui-github-io.onrender.com/api';
  static MONTH_ORDER = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
}

// =============================================================================
// DASHBOARD MANAGER - Main Application Controller
// =============================================================================
class DashboardManager {
  static init() {
    this.initializeEventListeners();
    this.initializeComponents();
    this.initializeTimeline();
  }

  static initializeComponents() {
    // Initialize all dashboard components
    SavingsChart.init();
    DocumentTracker.init();
    BudgetChart.init();
  }

  static initializeEventListeners() {
    // Theme Switcher
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.body.dataset.theme = theme;
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        SavingsChart.updateChartColors();
      });
    });

    // Modal close handlers
    document.getElementById('dataModal').addEventListener('click', (e) => {
      if (e.target.id === 'dataModal') SavingsChart.closeDataModal();
    });

    document.getElementById('widgetLibrary').addEventListener('click', (e) => {
      if (e.target.id === 'widgetLibrary') this.closeWidgetLibrary();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('dataModal').classList.contains('active')) {
        SavingsChart.closeDataModal();
      }
    });
  }

  static initializeTimeline() {
    const steps = Array.from(document.querySelectorAll('.timeline-step'));
    const progress = document.getElementById('timelineProgress');
    const wrapper = document.getElementById('timelineWrapper');

    function isVertical() { return window.matchMedia('(max-width:720px)').matches; }

    function setStep(stepIndex) {
      steps.forEach((s, idx) => {
        s.classList.remove('active', 'completed');
        if (idx < stepIndex - 1) s.classList.add('completed');
        else if (idx === stepIndex - 1) s.classList.add('active');
      });

      const target = steps[stepIndex - 1];
      const barRect = wrapper.querySelector('.timeline-bar').getBoundingClientRect();
      const targetDot = target.querySelector('.dot').getBoundingClientRect();

      if (isVertical()) {
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
  }

  // Widget Management
  static openWidgetLibrary() {
    document.getElementById('widgetLibrary').classList.add('active');
  }

  static closeWidgetLibrary() {
    document.getElementById('widgetLibrary').classList.remove('active');
  }

  static deleteWidget(btn) {
    const widget = btn.closest('.card, .chart-section, .clock-widget, .todo-widget, .table-section');
    widget.style.opacity = '0';
    widget.style.transform = 'scale(0.8)';
    setTimeout(() => widget.remove(), 300);
  }

  static addWidget(type) {
    const container = document.getElementById('widgetsContainer');
    const widgetHTML = WidgetFactory.createWidget(type);
    
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
      ClockWidget.init();
    }
    
    this.closeWidgetLibrary();
  }
}

// =============================================================================
// WIDGET FACTORY - Creates different widget types
// =============================================================================
class WidgetFactory {
  static createWidget(type) {
    const widgets = {
      clock: `
        <div class="card clock-widget">
          <button class="delete-widget" onclick="DashboardManager.deleteWidget(this)">
            <i class="bi bi-x"></i>
          </button>
          <h2 class="clock-time" id="clockTime">00:00:00</h2>
          <p class="clock-date" id="clockDate">Monday, January 1, 2024</p>
        </div>
      `,
      todo: `
        <div class="card todo-widget">
          <button class="delete-widget" onclick="DashboardManager.deleteWidget(this)">
            <i class="bi bi-x"></i>
          </button>
          <h3><i class="bi bi-check2-square"></i> Todo List</h3>
          <div class="todo-input-container">
            <input type="text" class="todo-input" placeholder="Add a task..." onkeypress="if(event.key==='Enter') TodoWidget.addTodo(this)">
            <button class="todo-add-btn" onclick="TodoWidget.addTodo(this.previousElementSibling)">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <ul class="todo-list"></ul>
        </div>
      `,
      counter: `
        <div class="card">
          <button class="delete-widget" onclick="DashboardManager.deleteWidget(this)">
            <i class="bi bi-x"></i>
          </button>
          <i class="bi bi-123"></i>
          <h3 class="counter-value">0</h3>
          <p>Counter</p>
          <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
            <button onclick="CounterWidget.update(this, -1)" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">-</button>
            <button onclick="CounterWidget.update(this, 1)" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">+</button>
          </div>
        </div>
      `,
      progress: `
        <div class="card">
          <button class="delete-widget" onclick="DashboardManager.deleteWidget(this)">
            <i class="bi bi-x"></i>
          </button>
          <i class="bi bi-bar-chart"></i>
          <h3>75%</h3>
          <p>Goal Progress</p>
          <div style="background: var(--bg-primary); height: 10px; border-radius: 5px; overflow: hidden; margin-top: 1rem;">
            <div style="background: var(--accent-color); height: 100%; width: 75%; transition: width 0.5s;"></div>
          </div>
        </div>
      `,
      notes: `
        <div class="card" style="text-align: left;">
          <button class="delete-widget" onclick="DashboardManager.deleteWidget(this)">
            <i class="bi bi-x"></i>
          </button>
          <h3><i class="bi bi-journal-text"></i> Quick Notes</h3>
          <textarea style="width: 100%; min-height: 100px; padding: 0.75rem; border: 2px solid var(--accent-light); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-family: inherit; resize: vertical;" placeholder="Write your notes here..."></textarea>
        </div>
      `,
      stats: `
        <div class="card">
          <button class="delete-widget" onclick="DashboardManager.deleteWidget(this)">
            <i class="bi bi-x"></i>
          </button>
          <i class="bi bi-graph-up-arrow"></i>
          <h3 id="randomStat">${Math.floor(Math.random() * 1000)}</h3>
          <p>Random Stat</p>
        </div>
      `
    };

    return widgets[type] || '';
  }
}

// =============================================================================
// SAVINGS CHART - Handles savings data and chart
// =============================================================================
class SavingsChart {
  static monthlyData = {};
  static currentEditingMonth = null;
  static chart = null;

  static init() {
    this.loadCSVData();
  }

  static async loadCSVData() {
    try {
      const response = await fetch(`${Config.API_BASE_URL}/chart/data`);
      const result = await response.json();
      
      if (result.success) {
        this.processCSVData(result.data);
        this.initializeChart();
        this.updateSavingsDisplay();
      } else {
        throw new Error(result.error || 'Failed to load CSV data');
      }
    } catch (error) {
      console.warn('Error loading data:', error.message);
      this.monthlyData = {};
      this.initializeChart();
      this.updateSavingsDisplay();
    }
  }

  static processCSVData(dataArray) {
    this.monthlyData = {};

    dataArray.forEach(item => {
      const month = item.Month?.trim();
      const year = item.Year?.trim();
      const key = `${month} ${year}`;
      const reason = item.Reason;
      const valueRaw = item['Value\r'] ?? item.Value ?? 0;
      const value = Number(String(valueRaw).trim()) || 0;

      if (!this.monthlyData[key]) this.monthlyData[key] = [];
      this.monthlyData[key].push({ reason, value });
    });

    console.log("Processed monthlyData:", this.monthlyData);
  }

  static getSortedMonths() {
    return Object.keys(this.monthlyData).sort((a,b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      if (Number(yearA) !== Number(yearB)) return Number(yearA) - Number(yearB);
      return Config.MONTH_ORDER[monthA] - Config.MONTH_ORDER[monthB];
    });
  }

  static async saveToCSV() {
    const csvLines = ['Month,Year,Reason,Value'];
    
    const sortedKeys = this.getSortedMonths();
    
    sortedKeys.forEach(key => {
      const [month, year] = key.split(' ');
      this.monthlyData[key].forEach(entry => {
        csvLines.push(`${month},${year},${entry.reason},${entry.value}`);
      });
    });
    
    const csvContent = csvLines.join('\n');
    
    try {
      const response = await fetch(`${Config.API_BASE_URL}/chart/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: csvLines.slice(1).map(line => {
          const [Month, Year, Reason, Value] = line.split(',');
          return { Month, Year, Reason, Value };
        })})
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

  static initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const sortedMonths = this.getSortedMonths();
    
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedMonths,
        datasets: [{
          label: 'Cumulative Savings',
          data: this.calculateMonthlyTotals(),
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
            title: { display: true, text: 'Cumulative Amount (Eur)' }
          },
          x: {
            title: { display: true, text: 'Months' }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const elementIndex = elements[0].index;
            const month = this.chart.data.labels[elementIndex];
            this.openDataModal(month);
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const month = context.label;
                const cumulativeTotal = context.parsed.y;
                const currentMonthTotal = this.calculateCurrentMonthTotal(month);
                return `Cumulative: ${cumulativeTotal} Eur | This Month: ${currentMonthTotal} Eur`;
              },
              afterLabel: (context) => {
                const month = context.label;
                const details = this.monthlyData[month];
                if (details && details.length > 0) {
                  return ['Breakdown:'].concat(details.map(item => `  ${item.reason}: ${item.value} Eur`)).join('\n');
                }
                return '';
              }
            }
          },
          legend: { display: false }
        }
      }
    });
  }

  static calculateMonthlyTotals() {
    const sortedMonths = this.getSortedMonths();
    const monthlyTotals = sortedMonths.map(month => {
      return this.monthlyData[month].reduce((total, item) => total + item.value, 0);
    });

    return this.calculateCumulativeTotals(monthlyTotals);
  }

  static calculateCumulativeTotals(monthlyTotals) {
    const cumulativeTotals = [];
    let runningTotal = 0;
    
    monthlyTotals.forEach(total => {
      runningTotal += total;
      cumulativeTotals.push(runningTotal);
    });
    
    return cumulativeTotals;
  }

  static calculateCurrentMonthTotal(month) {
    return this.monthlyData[month] ? this.monthlyData[month].reduce((total, item) => total + item.value, 0) : 0;
  }

  static calculateCumulativeTotalUpTo(month) {
    const months = this.getSortedMonths();
    const targetIndex = months.indexOf(month);
    let cumulativeTotal = 0;
    
    for (let i = 0; i <= targetIndex; i++) {
      cumulativeTotal += this.calculateCurrentMonthTotal(months[i]);
    }
    
    return cumulativeTotal;
  }

  static openDataModal(month) {
    this.currentEditingMonth = month;
    const currentMonthTotal = this.calculateCurrentMonthTotal(month);
    const cumulativeTotal = this.calculateCumulativeTotalUpTo(month);
    
    document.getElementById('modalMonth').textContent = 
      `${month} Details - This Month: ${currentMonthTotal} Eur | Cumulative: ${cumulativeTotal} Eur`;
    
    this.populateDataTable(month);
    document.getElementById('dataModal').classList.add('active');
    this.highlightChartPoint(month);
  }

  static closeDataModal() {
    document.getElementById('dataModal').classList.remove('active');
    this.currentEditingMonth = null;
    this.clearInputs();
    this.removeChartHighlight();
  }

  static populateDataTable(month) {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';
    
    if (!this.monthlyData[month]) {
      this.monthlyData[month] = [];
    }
    
    this.monthlyData[month].forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="text" value="${item.reason}" onchange="SavingsChart.updateDataField(${index}, 'reason', this.value)" class="reason-edit"></td>
        <td><input type="number" value="${item.value}" onchange="SavingsChart.updateDataField(${index}, 'value', parseInt(this.value))" class="value-edit"></td>
        <td><button onclick="SavingsChart.deleteDataRow(${index})" class="delete-row">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  static addDataRow() {
    const reasonInput = document.getElementById('reasonInput');
    const valueInput = document.getElementById('valueInput');
    
    const reason = reasonInput.value.trim();
    const value = parseInt(valueInput.value);
    
    if (!reason || isNaN(value)) {
      alert('Please enter both reason and value');
      return;
    }
    
    if (!this.monthlyData[this.currentEditingMonth]) {
      this.monthlyData[this.currentEditingMonth] = [];
    }
    
    this.monthlyData[this.currentEditingMonth].push({ reason, value });
    this.populateDataTable(this.currentEditingMonth);
    this.clearInputs();
  }

  static deleteDataRow(index) {
    this.monthlyData[this.currentEditingMonth].splice(index, 1);
    this.populateDataTable(this.currentEditingMonth);
    this.saveToCSV();
  }

  static updateDataField(index, field, value) {
    this.monthlyData[this.currentEditingMonth][index][field] = value;
    this.saveToCSV();
  }

  static clearInputs() {
    document.getElementById('reasonInput').value = '';
    document.getElementById('valueInput').value = '';
  }

  static saveMonthData() {
    this.chart.data.labels = this.getSortedMonths();
    this.chart.data.datasets[0].data = this.calculateMonthlyTotals();
    this.chart.update();
    this.updateSavingsDisplay();
    this.saveToCSV();
    this.closeDataModal();
  }

  static updateSavingsDisplay() {
    const monthlyElement = document.getElementById('monthlySavings');
    const currentElement = document.getElementById('currentSavings');
    
    if (monthlyElement && currentElement) {
      const months = this.getSortedMonths();
      if (months.length === 0) {
        monthlyElement.textContent = '0 Eur';
        currentElement.textContent = '0 Eur';
        return;
      }
      
      const latestMonth = months[months.length - 1];
      const monthlyVal = this.calculateCurrentMonthTotal(latestMonth);
      const cumulativeTotals = this.calculateMonthlyTotals();
      const currentVal = cumulativeTotals[cumulativeTotals.length - 1];
      
      monthlyElement.textContent = monthlyVal + ' Eur';
      currentElement.textContent = currentVal + ' Eur';
    }
  }

  static updateChartColors() {
    if (this.chart) {
      this.chart.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      this.chart.data.datasets[0].backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-light');
      this.chart.data.datasets[0].pointBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      this.chart.update();
    }
  }

  static highlightChartPoint(month) {
    const monthIndex = this.chart.data.labels.indexOf(month);
    this.chart.data.datasets[0].pointBackgroundColor = this.chart.data.labels.map((label, index) => 
      index === monthIndex ? getComputedStyle(document.documentElement).getPropertyValue('--accent-color') : getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
    );
    this.chart.data.datasets[0].pointRadius = this.chart.data.labels.map((label, index) => 
      index === monthIndex ? 8 : 6
    );
    this.chart.update();
  }

  static removeChartHighlight() {
    this.chart.data.datasets[0].pointBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    this.chart.data.datasets[0].pointRadius = 6;
    this.chart.update();
  }
}

// =============================================================================
// BUDGET CHART - Handles budget bar chart
// =============================================================================
class BudgetChart {
  static init() {
    this.loadChartData();
  }

  static async loadChartData() {
    console.log("📊 Starting to load chart data...");

    try {
      console.log(`➡️ Fetching from: ${Config.API_BASE_URL}/bar/data`);
      const response = await fetch(Config.API_BASE_URL + "/bar/data");

      if (!response.ok) {
        console.error(`❌ HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Raw API response:", result);

      if (!result.success) {
        console.error("⚠️ API returned success: false");
        throw new Error("API returned success: false");
      }
      if (!Array.isArray(result.data)) {
        console.error("⚠️ API data is not an array:", result.data);
        throw new Error("Invalid data format from API");
      }

      const labels = result.data.map(item => item.Description);
      const values = result.data.map(item => item.Cost);

      console.log("📌 Labels:", labels);
      console.log("💰 Values:", values);

      if (labels.length === 0 || values.length === 0) {
        console.warn("⚠️ No data found to render chart!");
        return;
      }

      this.renderBudgetChart(labels, values);
      console.log("✅ Chart rendered successfully!");

    } catch (error) {
      console.error("🚨 Error loading chart data:", error);
    }
  }

  static renderBudgetChart(labels, values) {
    console.log("📈 Rendering chart with data:", { labels, values });

    const canvas = document.getElementById('budgetChart');
    if (!canvas) {
      console.error("❌ Canvas element with ID 'budgetChart' not found!");
      return;
    }

    const ctx = canvas.getContext('2d');

    if (window.budgetChartInstance) {
      console.log("♻️ Destroying existing chart instance...");
      window.budgetChartInstance.destroy();
    }

    window.budgetChartInstance = new Chart(ctx, {
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

    console.log("✅ Chart successfully created!");
  }
}

// =============================================================================
// DOCUMENT TRACKER - Handles document tracking table
// =============================================================================
class DocumentTracker {
  static table = document.getElementById("tableCSV");
  static tableHeader = document.getElementById("tableHeader");
  static tableBody = document.getElementById("tableBody");
  static hasUnsavedChanges = false;
  static isLoading = false;

  static init() {
    this.initializeEventListeners();
    this.loadCSVData();
  }

  static initializeEventListeners() {
    this.tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains(`table-action-btn`)) {
        this.toggleRow(e.target);
      }
    });
  }

  static async loadCSVData() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      console.log("Loading Table Data 🔃");
      const response = await fetch(Config.API_BASE_URL + "/data");
      
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

  static cleartable() {
    this.tableHeader.innerHTML = ``;
    this.tableBody.innerHTML = ``;    
  }

  static createHeader(data) {
    const headerRow = document.createElement('tr');
    
    Object.keys(data[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    
    const actionTh = document.createElement("th");
    actionTh.textContent = "Actions";
    headerRow.appendChild(actionTh);

    return headerRow;
  }

  static renderTable(data) {
    this.cleartable();

    if (!data || data.length === 0) {
      console.log("No data to render");
      return;
    }

    const headerRow = this.createHeader(data);
    this.tableHeader.appendChild(headerRow);

    data.forEach((row) => {
      this.createTableRow(row);
    });
  }

  static createTableRow(rowData) {
    const tr = document.createElement("tr");

    Object.values(rowData).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const secondCell = tr.cells[1];
    if (secondCell && secondCell.textContent.trim().toLowerCase() === "completed") {
      tr.style.backgroundColor = "lightgreen";
      Array.from(tr.cells).forEach((cell) => (cell.style.fontWeight = "bold"));
    }

    const actionTd = document.createElement("td");
    const togglebtn = document.createElement("button");
    togglebtn.type = "button";
    togglebtn.textContent = "Toggle";
    togglebtn.className = `table-action-btn`;
    actionTd.appendChild(togglebtn);
    tr.appendChild(actionTd);

    this.tableBody.appendChild(tr);
    return tr;
  }

  static toggleRow(button) {
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

  static async saveChanges() {
    console.log("🔵 saveChanges called");

    try {
      console.log("🔵 Building data...");
      
      const headerCells = this.tableHeader.querySelectorAll("th");
      const headers = Array.from(headerCells)
        .map((th) => th.textContent)
        .filter((header) => header !== "Actions");

      const data = [];
      const rows = this.tableBody.querySelectorAll("tr");

      rows.forEach((row) => {
        const rowData = {};
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
          if (index < headers.length) {
            rowData[headers[index]] = cell.textContent.trim();
          }
        });

        if (Object.keys(rowData).length > 0) {
          data.push(rowData);
        }
      });

      console.log("🔵 Sending fetch request...", data);
      const response = await fetch(Config.API_BASE_URL + "/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

// =============================================================================
// UTILITY WIDGETS - Simple widget functionality
// =============================================================================
class ClockWidget {
  static init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  static updateClock() {
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
}

class TodoWidget {
  static addTodo(input) {
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
}

class CounterWidget {
  static update(btn, change) {
    const counter = btn.closest('.card').querySelector('.counter-value');
    const currentValue = parseInt(counter.textContent);
    counter.textContent = currentValue + change;
  }
}

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  DashboardManager.init();
});

// Real-time updates simulation
setInterval(() => {
  const monthlyElement = document.getElementById('monthlySavings');
  const currentElement = document.getElementById('currentSavings');
  
  if (monthlyElement && currentElement) {
    monthlyElement.textContent = `1300 Eur`;
    currentElement.textContent = `0 Eur`;
  }
}, 5000);