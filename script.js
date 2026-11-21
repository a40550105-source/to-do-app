const STORAGE_KEY = "my-todo-list.tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (
      Array.isArray(savedTasks) &&
      savedTasks.every(
        (task) =>
          task &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean",
      )
    ) {
      return savedTasks;
    }
  } catch (error) {
    console.warn("Could not load saved tasks.", error);
  }
  return [];
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("Could not save tasks in this browser.", error);
  }
}

function createIcon(path) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");

  const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shape.setAttribute("d", path);
  icon.append(shape);
  return icon;
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });
  const remainingCount = tasks.filter((task) => !task.completed).length;

  taskList.replaceChildren();
  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-completed" : ""}`;

    const toggle = document.createElement("button");
    toggle.className = "task-toggle";
    toggle.type = "button";
    toggle.setAttribute(
      "aria-label",
      task.completed ? `Mark ${task.text} as active` : `Complete ${task.text}`,
    );
    toggle.setAttribute("aria-pressed", String(task.completed));
    if (task.completed) {
      toggle.append(createIcon("M5 12l4 4L19 6"));
    }
    toggle.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.append(createIcon("M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"));
    remove.addEventListener("click", () => deleteTask(task.id));

    item.append(toggle, text, remove);
    taskList.append(item);
  }

  taskCount.textContent = `${remainingCount} ${remainingCount === 1 ? "task" : "tasks"} left`;
  emptyState.hidden = visibleTasks.length > 0;
  emptyMessage.textContent =
    tasks.length === 0
      ? "Your list is clear. Add a task to get started."
      : "Nothing here for this filter.";
  clearCompletedButton.hidden = !tasks.some((task) => task.completed);
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
