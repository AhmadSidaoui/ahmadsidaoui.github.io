import { Config } from '../core/Config.js';

// =============================================================================
// BUDGET CHART - Handles budget bar chart
// =============================================================================
export class BudgetChart {
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