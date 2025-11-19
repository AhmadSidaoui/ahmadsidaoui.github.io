import { Config } from './Config.js';
import { WidgetFactory } from './WidgetFactory.js';

// =============================================================================
// DASHBOARD MANAGER - Main Application Controller
// =============================================================================
export class DashboardManager {
  static init() {
    this.initializeEventListeners();
    this.initializeComponents();
    this.initializeTimeline();
  }

  static initializeComponents() {
    // Dynamic imports for better performance
    import('../components/SavingsChart.js').then(module => module.SavingsChart.init());
    import('../components/DocumentTracker.js').then(module => module.DocumentTracker.init());
    import('../components/BudgetChart.js').then(module => module.BudgetChart.init());
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
        
        // Update chart colors when theme changes
        if (window.SavingsChart) {
          window.SavingsChart.updateChartColors();
        }
      });
    });

    // Modal close handlers
    document.getElementById('dataModal').addEventListener('click', (e) => {
      if (e.target.id === 'dataModal' && window.SavingsChart) {
        window.SavingsChart.closeDataModal();
      }
    });

    document.getElementById('widgetLibrary').addEventListener('click', (e) => {
      if (e.target.id === 'widgetLibrary') this.closeWidgetLibrary();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('dataModal').classList.contains('active')) {
        if (window.SavingsChart) {
          window.SavingsChart.closeDataModal();
        }
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
      import('../widgets/ClockWidget.js').then(module => module.ClockWidget.init());
    }
    
    this.closeWidgetLibrary();
  }
}

// Make globally available
window.DashboardManager = DashboardManager;