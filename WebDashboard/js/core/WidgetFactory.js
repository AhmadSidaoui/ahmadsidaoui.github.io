// =============================================================================
// WIDGET FACTORY - Creates different widget types
// =============================================================================
export class WidgetFactory {
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