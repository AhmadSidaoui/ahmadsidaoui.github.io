import { Config } from '../core/Config.js';

// =============================================================================
// SAVINGS CHART - Handles savings data and chart
// =============================================================================
export class SavingsChart {
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

// Make globally available
window.SavingsChart = SavingsChart;