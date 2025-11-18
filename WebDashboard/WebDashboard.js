// Backend API URL
const API_BASE_URL = 'https://ahmadsidaoui-github-io.onrender.com/api';

// Base class for API communication
class APIService {
    static async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
        }
        
        return await response.json();
    }

    static async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}

// Base class for data visualization components
class DataVisualization {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.chart = null;
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    updateTheme() {
        if (this.chart) {
            this.chart.update();
        }
    }
}

// Chart component for savings visualization
class SavingsChart extends DataVisualization {
    constructor(containerId, dataManager) {
        super(containerId);
        this.dataManager = dataManager;
        this.monthOrder = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    }

    initialize() {
        const ctx = this.container.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getSortedMonths(),
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
            options: this.getChartOptions()
        });
    }

    getChartOptions() {
        return {
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
                    const month = this.chart.data.labels[elements[0].index];
                    this.dataManager.openMonthModal(month);
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const month = context.label;
                            const cumulativeTotal = context.parsed.y;
                            const currentMonthTotal = this.dataManager.calculateCurrentMonthTotal(month);
                            return `Cumulative: ${cumulativeTotal} Eur | This Month: ${currentMonthTotal} Eur`;
                        },
                        afterLabel: (context) => {
                            const month = context.label;
                            const details = this.dataManager.getMonthData(month);
                            if (details && details.length > 0) {
                                return ['Breakdown:'].concat(details.map(item => `  ${item.reason}: ${item.value} Eur`)).join('\n');
                            }
                            return '';
                        }
                    }
                },
                legend: { display: false }
            }
        };
    }

    getSortedMonths() {
        const months = Object.keys(this.dataManager.monthlyData || {});
        return months.sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            if (Number(yearA) !== Number(yearB)) return Number(yearA) - Number(yearB);
            return this.monthOrder[monthA] - this.monthOrder[monthB];
        });
    }

    calculateMonthlyTotals() {
        const sortedMonths = this.getSortedMonths();
        const monthlyTotals = sortedMonths.map(month => 
            this.dataManager.calculateCurrentMonthTotal(month)
        );
        return this.calculateCumulativeTotals(monthlyTotals);
    }

    calculateCumulativeTotals(monthlyTotals) {
        const cumulativeTotals = [];
        let runningTotal = 0;
        
        monthlyTotals.forEach(total => {
            runningTotal += total;
            cumulativeTotals.push(runningTotal);
        });
        
        return cumulativeTotals;
    }

    update() {
        if (this.chart) {
            this.chart.data.labels = this.getSortedMonths();
            this.chart.data.datasets[0].data = this.calculateMonthlyTotals();
            this.chart.update();
        }
    }

    highlightPoint(month) {
        const monthIndex = this.chart.data.labels.indexOf(month);
        this.chart.data.datasets[0].pointBackgroundColor = this.chart.data.labels.map((label, index) => 
            index === monthIndex ? getComputedStyle(document.documentElement).getPropertyValue('--accent-color') : getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
        );
        this.chart.data.datasets[0].pointRadius = this.chart.data.labels.map((label, index) => 
            index === monthIndex ? 8 : 6
        );
        this.chart.update();
    }

    removeHighlight() {
        this.chart.data.datasets[0].pointBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        this.chart.data.datasets[0].pointRadius = 6;
        this.chart.update();
    }
}

// Budget Chart component
class BudgetChart extends DataVisualization {
    constructor(containerId) {
        super(containerId);
    }

    async initialize() {
        try {
            const result = await APIService.get('/bar/data');
            if (result.success && Array.isArray(result.data)) {
                this.render(result.data);
            }
        } catch (error) {
            console.error('Error loading budget chart:', error);
        }
    }

    render(data) {
        const labels = data.map(item => item.Description);
        const values = data.map(item => item.Cost);

        if (window.budgetChartInstance) {
            window.budgetChartInstance.destroy();
        }

        window.budgetChartInstance = new Chart(this.container, {
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
}

// Data Manager for savings data
class SavingsDataManager {
    constructor() {
        this.monthlyData = {};
        this.currentEditingMonth = null;
    }

    async loadData() {
        try {
            const result = await APIService.get('/chart/data');
            if (result.success) {
                this.processData(result.data);
                return true;
            }
        } catch (error) {
            console.warn('Error loading savings data:', error);
            this.monthlyData = {};
        }
        return false;
    }

    processData(dataArray) {
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
    }

    async saveData() {
        const csvLines = ['Month,Year,Reason,Value'];
        const monthOrder = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
        
        const sortedKeys = Object.keys(this.monthlyData).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            if (Number(yearA) !== Number(yearB)) return Number(yearA) - Number(yearB);
            return monthOrder[monthA] - monthOrder[monthB];
        });
        
        sortedKeys.forEach(key => {
            const [month, year] = key.split(' ');
            this.monthlyData[key].forEach(entry => {
                csvLines.push(`${month},${year},${entry.reason},${entry.value}`);
            });
        });
        
        try {
            await APIService.post('/chart/save', { data: csvLines.map(line => {
                const [Month, Year, Reason, Value] = line.split(',');
                return { Month, Year, Reason, Value };
            }).slice(1) }); // Remove header
        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    }

    calculateCurrentMonthTotal(month) {
        return this.monthlyData[month] ? 
            this.monthlyData[month].reduce((total, item) => total + item.value, 0) : 0;
    }

    calculateCumulativeTotalUpTo(month) {
        const months = Object.keys(this.monthlyData).sort();
        const targetIndex = months.indexOf(month);
        let cumulativeTotal = 0;
        
        for (let i = 0; i <= targetIndex; i++) {
            cumulativeTotal += this.calculateCurrentMonthTotal(months[i]);
        }
        
        return cumulativeTotal;
    }

    getMonthData(month) {
        return this.monthlyData[month] || [];
    }

    addMonthEntry(month, reason, value) {
        if (!this.monthlyData[month]) {
            this.monthlyData[month] = [];
        }
        this.monthlyData[month].push({ reason, value });
    }

    updateMonthEntry(month, index, field, value) {
        if (this.monthlyData[month] && this.monthlyData[month][index]) {
            this.monthlyData[month][index][field] = value;
        }
    }

    deleteMonthEntry(month, index) {
        if (this.monthlyData[month]) {
            this.monthlyData[month].splice(index, 1);
        }
    }
}

// Modal Manager for data editing
class ModalManager {
    constructor(dataManager, chart) {
        this.dataManager = dataManager;
        this.chart = chart;
        this.modal = document.getElementById('dataModal');
        this.tableBody = document.getElementById('dataTableBody');
        this.reasonInput = document.getElementById('reasonInput');
        this.valueInput = document.getElementById('valueInput');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(month) {
        this.dataManager.currentEditingMonth = month;
        const currentMonthTotal = this.dataManager.calculateCurrentMonthTotal(month);
        const cumulativeTotal = this.dataManager.calculateCumulativeTotalUpTo(month);
        
        document.getElementById('modalMonth').textContent = 
            `${month} Details - This Month: ${currentMonthTotal} Eur | Cumulative: ${cumulativeTotal} Eur`;
        
        this.populateTable(month);
        this.modal.classList.add('active');
        this.chart.highlightPoint(month);
    }

    close() {
        this.modal.classList.remove('active');
        this.dataManager.currentEditingMonth = null;
        this.clearInputs();
        this.chart.removeHighlight();
    }

    populateTable(month) {
        this.tableBody.innerHTML = '';
        const monthData = this.dataManager.getMonthData(month);

        monthData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" value="${item.reason}" onchange="app.savingsDataManager.updateMonthEntry('${month}', ${index}, 'reason', this.value)" class="reason-edit"></td>
                <td><input type="number" value="${item.value}" onchange="app.savingsDataManager.updateMonthEntry('${month}', ${index}, 'value', parseInt(this.value))" class="value-edit"></td>
                <td><button onclick="app.savingsDataManager.deleteMonthEntry('${month}', ${index})" class="delete-row">Delete</button></td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    addRow() {
        const reason = this.reasonInput.value.trim();
        const value = parseInt(this.valueInput.value);
        
        if (!reason || isNaN(value)) {
            alert('Please enter both reason and value');
            return;
        }
        
        this.dataManager.addMonthEntry(this.dataManager.currentEditingMonth, reason, value);
        this.populateTable(this.dataManager.currentEditingMonth);
        this.clearInputs();
    }

    clearInputs() {
        this.reasonInput.value = '';
        this.valueInput.value = '';
    }
}

// Generic Table Component
class DynamicTable {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        this.config = {
            apiEndpoint: config.apiEndpoint || '/data',
            saveEndpoint: config.saveEndpoint || '/save',
            actions: config.actions || ['toggle'],
            columns: config.columns || [],
            ...config
        };
        this.data = [];
        this.hasUnsavedChanges = false;
        
        this.initialize();
    }

    initialize() {
        this.createTableStructure();
        this.loadData();
    }

    createTableStructure() {
        this.container.innerHTML = `
            <div class="table-header">
                <h3>${this.config.title || 'Data Table'}</h3>
            </div>
            <table>
                <thead id="${this.config.containerId}-header"></thead>
                <tbody id="${this.config.containerId}-body"></tbody>
            </table>
        `;
        
        this.tableHeader = document.getElementById(`${this.config.containerId}-header`);
        this.tableBody = document.getElementById(`${this.config.containerId}-body`);
        
        if (this.config.actions.includes('click')) {
            this.tableBody.addEventListener('click', (e) => this.handleRowClick(e));
        }
    }

    async loadData() {
        try {
            const result = await APIService.get(this.config.apiEndpoint);
            if (result.success) {
                this.data = result.data;
                this.render();
            }
        } catch (error) {
            console.error('Error loading table data:', error);
        }
    }

    render() {
        this.renderHeader();
        this.renderBody();
    }

    renderHeader() {
        this.tableHeader.innerHTML = '';
        const headerRow = document.createElement('tr');
        
        if (this.data.length > 0) {
            Object.keys(this.data[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
        } else if (this.config.columns.length > 0) {
            this.config.columns.forEach(column => {
                const th = document.createElement('th');
                th.textContent = column;
                headerRow.appendChild(th);
            });
        }
        
        if (this.config.actions.length > 0) {
            const actionTh = document.createElement('th');
            actionTh.textContent = 'Actions';
            headerRow.appendChild(actionTh);
        }
        
        this.tableHeader.appendChild(headerRow);
    }

    renderBody() {
        this.tableBody.innerHTML = '';
        
        this.data.forEach((rowData, index) => {
            const tr = document.createElement('tr');
            
            Object.values(rowData).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });

            this.applyRowStyling(tr, rowData);
            
            if (this.config.actions.length > 0) {
                const actionTd = document.createElement('td');
                this.config.actions.forEach(action => {
                    actionTd.appendChild(this.createActionButton(action, index));
                });
                tr.appendChild(actionTd);
            }
            
            this.tableBody.appendChild(tr);
        });
    }

    applyRowStyling(tr, rowData) {
        // Override this method in subclasses for custom styling
        const secondCell = tr.cells[1];
        if (secondCell && secondCell.textContent.trim().toLowerCase() === 'completed') {
            tr.style.backgroundColor = 'lightgreen';
            Array.from(tr.cells).forEach(cell => cell.style.fontWeight = 'bold');
        }
    }

    createActionButton(action, index) {
        const button = document.createElement('button');
        button.type = 'button';
        
        switch(action) {
            case 'toggle':
                button.textContent = 'Toggle';
                button.className = 'table-action-btn';
                button.onclick = (e) => this.toggleRow(e.target);
                break;
            case 'delete':
                button.textContent = 'Delete';
                button.className = 'delete-row';
                button.onclick = () => this.deleteRow(index);
                break;
            default:
                button.textContent = action;
                button.className = 'table-action-btn';
        }
        
        return button;
    }

    toggleRow(button) {
        const row = button.closest('tr');
        const secondCell = row.cells[1];

        if (!secondCell) return;

        const currentStatus = secondCell.textContent.trim().toLowerCase();
        const newStatus = currentStatus === 'completed' ? 'Pending' : 'Completed';

        secondCell.textContent = newStatus;
        
        if (newStatus === 'Completed') {
            row.style.backgroundColor = 'lightgreen';
            Array.from(row.cells).forEach(cell => cell.style.fontWeight = 'bold');
        } else {
            row.style.backgroundColor = '';
            Array.from(row.cells).forEach(cell => cell.style.fontWeight = 'normal');
        }

        this.hasUnsavedChanges = true;
        this.saveChanges();
    }

    async saveChanges() {
        try {
            const headers = Array.from(this.tableHeader.querySelectorAll('th'))
                .map(th => th.textContent)
                .filter(header => header !== 'Actions');

            const data = Array.from(this.tableBody.querySelectorAll('tr')).map(row => {
                const rowData = {};
                const cells = row.querySelectorAll('td');
                
                cells.forEach((cell, index) => {
                    if (index < headers.length) {
                        rowData[headers[index]] = cell.textContent.trim();
                    }
                });
                
                return rowData;
            }).filter(row => Object.keys(row).length > 0);

            await APIService.post(this.config.saveEndpoint, { data });
            this.hasUnsavedChanges = false;
        } catch (error) {
            console.error('Error saving table data:', error);
        }
    }

    deleteRow(index) {
        this.data.splice(index, 1);
        this.render();
        this.saveChanges();
    }

    handleRowClick(event) {
        // Override for custom click handling
    }
}

// Document Tracker Table (specialized table)
class DocumentTrackerTable extends DynamicTable {
    constructor(containerId) {
        super(containerId, {
            containerId: 'documentTracker',
            apiEndpoint: '/data',
            saveEndpoint: '/save',
            actions: ['toggle'],
            title: 'Document Tracker'
        });
    }
}

// Widget Manager
class WidgetManager {
    constructor() {
        this.widgetsContainer = document.getElementById('widgetsContainer');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('widgetLibrary').addEventListener('click', (e) => {
            if (e.target.id === 'widgetLibrary') {
                this.closeLibrary();
            }
        });
    }

    openLibrary() {
        document.getElementById('widgetLibrary').classList.add('active');
    }

    closeLibrary() {
        document.getElementById('widgetLibrary').classList.remove('active');
    }

    deleteWidget(btn) {
        const widget = btn.closest('.card, .chart-section, .clock-widget, .todo-widget, .table-section');
        widget.style.opacity = '0';
        widget.style.transform = 'scale(0.8)';
        setTimeout(() => widget.remove(), 300);
    }

    addWidget(type) {
        let widgetHTML = '';
        
        switch(type) {
            case 'clock':
                widgetHTML = this.createClockWidget();
                break;
            case 'todo':
                widgetHTML = this.createTodoWidget();
                break;
            case 'counter':
                widgetHTML = this.createCounterWidget();
                break;
            case 'progress':
                widgetHTML = this.createProgressWidget();
                break;
            case 'notes':
                widgetHTML = this.createNotesWidget();
                break;
            case 'stats':
                widgetHTML = this.createStatsWidget();
                break;
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = widgetHTML;
        const widget = tempDiv.firstElementChild;
        
        this.animateWidgetInsertion(widget);
        this.widgetsContainer.appendChild(widget);
        
        if (type === 'clock') {
            this.initializeClockWidget(widget);
        }
        
        this.closeLibrary();
    }

    createClockWidget() {
        return `
            <div class="card clock-widget">
                <button class="delete-widget" onclick="app.widgetManager.deleteWidget(this)">
                    <i class="bi bi-x"></i>
                </button>
                <h2 class="clock-time">00:00:00</h2>
                <p class="clock-date">Monday, January 1, 2024</p>
            </div>
        `;
    }

    createTodoWidget() {
        return `
            <div class="card todo-widget">
                <button class="delete-widget" onclick="app.widgetManager.deleteWidget(this)">
                    <i class="bi bi-x"></i>
                </button>
                <h3><i class="bi bi-check2-square"></i> Todo List</h3>
                <div class="todo-input-container">
                    <input type="text" class="todo-input" placeholder="Add a task..." onkeypress="if(event.key==='Enter') app.widgetManager.addTodo(this)">
                    <button class="todo-add-btn" onclick="app.widgetManager.addTodo(this.previousElementSibling)">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
                <ul class="todo-list"></ul>
            </div>
        `;
    }

    createCounterWidget() {
        return `
            <div class="card">
                <button class="delete-widget" onclick="app.widgetManager.deleteWidget(this)">
                    <i class="bi bi-x"></i>
                </button>
                <i class="bi bi-123"></i>
                <h3 class="counter-value">0</h3>
                <p>Counter</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                    <button onclick="app.widgetManager.updateCounter(this, -1)" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">-</button>
                    <button onclick="app.widgetManager.updateCounter(this, 1)" style="background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">+</button>
                </div>
            </div>
        `;
    }

    createProgressWidget() {
        return `
            <div class="card">
                <button class="delete-widget" onclick="app.widgetManager.deleteWidget(this)">
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
    }

    createNotesWidget() {
        return `
            <div class="card" style="text-align: left;">
                <button class="delete-widget" onclick="app.widgetManager.deleteWidget(this)">
                    <i class="bi bi-x"></i>
                </button>
                <h3><i class="bi bi-journal-text"></i> Quick Notes</h3>
                <textarea style="width: 100%; min-height: 100px; padding: 0.75rem; border: 2px solid var(--accent-light); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-family: inherit; resize: vertical;" placeholder="Write your notes here..."></textarea>
            </div>
        `;
    }

    createStatsWidget() {
        return `
            <div class="card">
                <button class="delete-widget" onclick="app.widgetManager.deleteWidget(this)">
                    <i class="bi bi-x"></i>
                </button>
                <i class="bi bi-graph-up-arrow"></i>
                <h3 class="random-stat">${Math.floor(Math.random() * 1000)}</h3>
                <p>Random Stat</p>
            </div>
        `;
    }

    animateWidgetInsertion(widget) {
        widget.style.opacity = '0';
        widget.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            widget.style.opacity = '1';
            widget.style.transform = 'scale(1)';
        }, 10);
    }

    initializeClockWidget(widget) {
        const updateClock = () => {
            const clockTime = widget.querySelector('.clock-time');
            const clockDate = widget.querySelector('.clock-date');
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
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    addTodo(input) {
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

    updateCounter(btn, change) {
        const counter = btn.closest('.card').querySelector('.counter-value');
        const currentValue = parseInt(counter.textContent);
        counter.textContent = currentValue + change;
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.setTheme(theme);
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setTheme(theme) {
        document.body.dataset.theme = theme;
        app.updateChartsTheme();
    }
}

// Timeline Component
class Timeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.steps = Array.from(this.container.querySelectorAll('.timeline-step'));
        this.progress = this.container.querySelector('#timelineProgress');
        this.wrapper = this.container.querySelector('#timelineWrapper');
        
        this.initialize();
    }

    initialize() {
        this.steps.forEach(step => {
            step.addEventListener('click', () => this.setStep(+step.dataset.step));
        });
        
        window.addEventListener('resize', () => {
            const active = this.steps.findIndex(step => step.classList.contains('active'));
            this.setStep(active >= 0 ? active + 1 : 1);
        });
        
        this.setStep(1);
    }

    isVertical() {
        return window.matchMedia('(max-width:720px)').matches;
    }

    setStep(stepIndex) {
        this.steps.forEach((step, idx) => {
            step.classList.remove('active', 'completed');
            if (idx < stepIndex - 1) step.classList.add('completed');
            else if (idx === stepIndex - 1) step.classList.add('active');
        });

        const target = this.steps[stepIndex - 1];
        const barRect = this.wrapper.querySelector('.timeline-bar').getBoundingClientRect();
        const targetDot = target.querySelector('.dot').getBoundingClientRect();

        if (this.isVertical()) {
            const barTop = barRect.top;
            const barHeight = barRect.height || 1;
            const centerY = (targetDot.top + targetDot.bottom) / 2;
            const filled = Math.max(0, Math.min(1, (centerY - barTop) / barHeight));
            this.progress.style.height = (filled * 100).toFixed(2) + '%';
        } else {
            const barLeft = barRect.left;
            const barWidth = barRect.width || 1;
            const centerX = (targetDot.left + targetDot.right) / 2;
            const filled = Math.max(0, Math.min(1, (centerX - barLeft) / barWidth));
            this.progress.style.width = (filled * 100).toFixed(2) + '%';
        }
    }
}

// Main Application Class
class Application {
    constructor() {
        this.savingsDataManager = new SavingsDataManager();
        this.widgetManager = new WidgetManager();
        this.themeManager = new ThemeManager();
        this.timeline = new Timeline('timelineWrapper');
        
        this.components = {};
    }

    async initialize() {
        // Initialize savings chart
        this.savingsChart = new SavingsChart('myChart', this.savingsDataManager);
        await this.savingsDataManager.loadData();
        this.savingsChart.initialize();

        // Initialize budget chart
        this.budgetChart = new BudgetChart('budgetChart');
        await this.budgetChart.initialize();

        // Initialize document tracker table
        this.documentTracker = new DocumentTrackerTable('tableCSV');

        // Initialize modal manager
        this.modalManager = new ModalManager(this.savingsDataManager, this.savingsChart);

        // Update savings display
        this.updateSavingsDisplay();

        console.log('Application initialized successfully');
    }

    updateSavingsDisplay() {
        const monthlyElement = document.getElementById('monthlySavings');
        const currentElement = document.getElementById('currentSavings');
        
        if (monthlyElement && currentElement) {
            const months = Object.keys(this.savingsDataManager.monthlyData).sort();
            if (months.length === 0) {
                monthlyElement.textContent = '0 Eur';
                currentElement.textContent = '0 Eur';
                return;
            }
            
            const latestMonth = months[months.length - 1];
            const monthlyVal = this.savingsDataManager.calculateCurrentMonthTotal(latestMonth);
            const cumulativeTotals = this.savingsChart.calculateMonthlyTotals();
            const currentVal = cumulativeTotals[cumulativeTotals.length - 1];
            
            monthlyElement.textContent = monthlyVal + ' Eur';
            currentElement.textContent = currentVal + ' Eur';
        }
    }

    async saveMonthData() {
        try {
            await this.savingsDataManager.saveData();
            this.savingsChart.update();
            this.updateSavingsDisplay();
            this.modalManager.close();
        } catch (error) {
            console.error('Error saving month data:', error);
            alert('Error saving data: ' + error.message);
        }
    }

    updateChartsTheme() {
        this.savingsChart.updateTheme();
        if (window.budgetChartInstance) {
            window.budgetChartInstance.update();
        }
    }

    openMonthModal(month) {
        this.modalManager.open(month);
    }

    openWidgetLibrary() {
        this.widgetManager.openLibrary();
    }
}

// Global application instance
const app = new Application();

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Global functions for HTML event handlers
function openDataModal(month) {
    app.openMonthModal(month);
}

function closeDataModal() {
    app.modalManager.close();
}

function addDataRow() {
    app.modalManager.addRow();
}

function saveMonthData() {
    app.saveMonthData();
}

function openWidgetLibrary() {
    app.openWidgetLibrary();
}

function closeWidgetLibrary() {
    app.widgetManager.closeLibrary();
}

function addWidget(type) {
    app.widgetManager.addWidget(type);
}

function deleteWidget(btn) {
    app.widgetManager.deleteWidget(btn);
}

function addTodo(input) {
    app.widgetManager.addTodo(input);
}

function updateCounter(btn, change) {
    app.widgetManager.updateCounter(btn, change);
}