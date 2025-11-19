// =============================================================================
// MAIN APPLICATION ENTRY POINT
// =============================================================================
import { DashboardManager } from './core/DashboardManager.js';

// Initialize application when DOM is ready
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