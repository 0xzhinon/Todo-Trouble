(() => {
  const listEl = document.getElementById("todo-list");
  const formEl = document.getElementById("todo-form");
  const inputEl = document.getElementById("todo-input");

  const renderTodos = (todos) => {
    listEl.innerHTML = "";
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.textContent = todo;
      listEl.appendChild(li);
    });
  };

  const loadTodos = async () => {
    try {
      const res = await fetch("/todos");
      const data = await res.json();
      renderTodos(data.todos || []);
    } catch (err) {
      console.error("Failed to load todos", err);
    }
  };

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const todo = inputEl.value.trim();
    if (!todo) {
      return;
    }

    try {
      const res = await fetch("/add-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add todo");
        return;
      }

      const data = await res.json();
      // data.debug carries the leaked character; intentionally ignored in UI so it only appears in network tools.
      renderTodos(data.todos || []);
      inputEl.value = "";
      inputEl.focus();
    } catch (err) {
      console.error("Failed to add todo", err);
    }
  });

  loadTodos();
})();
