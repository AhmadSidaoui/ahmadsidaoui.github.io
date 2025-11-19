// =============================================================================
// TODO WIDGET - Handles todo list functionality
// =============================================================================
export class TodoWidget {
  static addTodo(input) {
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
}

// Make globally available
window.TodoWidget = TodoWidget;