// =============================================================================
// COUNTER WIDGET - Handles counter functionality
// =============================================================================
export class CounterWidget {
  static update(btn, change) {
    const counter = btn.closest('.card').querySelector('.counter-value');
    const currentValue = parseInt(counter.textContent);
    counter.textContent = currentValue + change;
  }
}

// Make globally available
window.CounterWidget = CounterWidget;