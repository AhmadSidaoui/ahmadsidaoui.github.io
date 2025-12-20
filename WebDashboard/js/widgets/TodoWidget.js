// =============================================================================
// TODO WIDGET - Handles todo list functionality
// =============================================================================

import { Config } from '../core/Config.js';


export class TodoWidget {
  static async init(widgetElement) {
    const list = widgetElement.querySelector(".todo-list");
    const input = widgetElement.querySelector("input[type=text]");

    // Fetch tasks from server
    // Fetch tasks from server
    try {
      const response = await fetch(`${Config.API_BASE_URL}/task/data`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        result.data.forEach(row => {
          // ⬇️ HERE is where it goes
          TodoWidget._addTaskToUI(list, row.Task, row.Status);
        });
      }

      console.log("✅ Tasks loaded from server:", result);

    } catch (err) {
      console.error("❌ Failed to load tasks:", err);
    }

  }

  static async _addTaskToUI(list, text, status = "Pending") {
    const li = document.createElement("li");
    li.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = status.toLowerCase() === "completed";

    if (checkbox.checked) {
      li.classList.add("completed");
    }

    checkbox.addEventListener("change", async () => {
      li.classList.toggle("completed");

      // Save immediately (same idea as DocumentTracker.toggleRow)
      await TodoWidget.saveAllTasks(list);
    });

    const span = document.createElement("span");
    span.textContent = text;

    const button = document.createElement("button");
    button.innerHTML = `<i class="bi bi-trash"></i>`;
    button.style = "margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer;";
    button.addEventListener("click", async () => {
      li.remove();
      await TodoWidget.saveAllTasks(list);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(button);

    list.appendChild(li);
  }


  static async addTodo(input) {
    const text = input.value.trim();
    if (!text) return;

    const list = input.closest(".card.todo-widget").querySelector(".todo-list");
    TodoWidget._addTaskToUI(list, text, "Pending");
    input.value = "";

    await TodoWidget.saveAllTasks(list);
  }


  static async saveAllTasks(list) {
    try {
      const tasks = Array.from(list.querySelectorAll(".todo-item")).map(li => ({
        Task: li.querySelector("span").textContent.trim(),
        Status: li.classList.contains("completed") ? "Completed" : "Pending"
      }));

      const response = await fetch(`${Config.API_BASE_URL}/task/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: tasks })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("✅ Todo list saved:", tasks);
    } catch (err) {
      console.error("❌ Failed to save tasks:", err);
    }
  }




}



// Make globally available
window.TodoWidget = TodoWidget;
