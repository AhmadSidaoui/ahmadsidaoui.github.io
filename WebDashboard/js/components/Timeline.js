// =============================================================================
// TIMELINE - Handles timeline component
// =============================================================================
export class Timeline {
  static init() {
    this.initializeTimeline();
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
}