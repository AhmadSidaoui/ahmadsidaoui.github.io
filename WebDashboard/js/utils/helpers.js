// =============================================================================
// HELPER FUNCTIONS - Utility functions
// =============================================================================
export class Helpers {
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transform = 'scale(0.8)';
    element.style.transition = `all ${duration}ms ease`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    });
  }

  static fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transform = 'scale(0.8)';
      setTimeout(() => resolve(), duration);
    });
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static formatCurrency(amount, currency = 'Eur') {
    return `${amount} ${currency}`;
  }

  static getThemeColor(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
  }
}