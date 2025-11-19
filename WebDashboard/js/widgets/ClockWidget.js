// =============================================================================
// CLOCK WIDGET - Handles clock functionality
// =============================================================================
export class ClockWidget {
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

// Make globally available
window.ClockWidget = ClockWidget;