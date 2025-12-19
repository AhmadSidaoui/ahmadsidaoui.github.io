// =============================================================================
// TODO WIDGET - Handles todo list functionality
// =============================================================================

import { Config } from '../core/Config.js';


export class TodoWidget {
  static async init(widgetElement) {
    const list = widgetElement.querySelector(".todo-list");
    const input = widgetElement.querySelector("input[type=text]");

    // Fetch tasks from server
    try {
      const response = await  fetch(`${Config.API_BASE_URL}/api/task/data`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        result.data.forEach(row => {
          TodoWidget._addTaskToUI(list, row.Task);
        });
      }

      console.log("✅ Tasks loaded from server:", result);

    } catch (err) {
      console.error("❌ Failed to load tasks:", err);
    }

    // Hook input to addTodo
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        TodoWidget.addTodo(input);
      }
    });
  }

  static _addTaskToUI(list, text) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.innerHTML = `
      <input type="checkbox" onchange="this.parentElement.classList.toggle('completed')">
      <span>${text}</span>
      <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer;">
        <i class="bi bi-trash"></i>
      </button>
    `;
    list.appendChild(li);
  }

  static async addTodo(input) {
    const text = input.value.trim();
    if (!text) return;

    const list = input.closest(".card.todo-widget").querySelector(".todo-list");
    TodoWidget._addTaskToUI(list, text);
    input.value = "";

    // Save tasks to server
    try {
      const tasks = Array.from(list.querySelectorAll(".todo-item span")).map(span => ({
        Task: span.textContent.trim()
      }));

      const response = await  fetch(`${Config.API_BASE_URL}/task/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: tasks })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      console.log("✅ Task saved to server:", result);

    } catch (err) {
      console.error("❌ Failed to save task:", err);
    }
  }
}

// Make globally available
window.TodoWidget = TodoWidget;
