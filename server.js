const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Hidden flag is ROT13-encoded so the leak is not obvious at first glance.
const flag = "ZZQP{ebg13_vf_rnfl}";
// Index tracks which character to leak next; kept in memory only for simplicity.
let leakIndex = 0;
const todos = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", (req, res) => {
  res.json({ todos });
});

app.post("/add-todo", (req, res) => {
  const { todo } = req.body || {};
  if (!todo || typeof todo !== "string" || !todo.trim()) {
    return res.status(400).json({ message: "Todo cannot be empty", todos });
  }

  const cleaned = todo.trim();
  todos.push(cleaned);

  // Leak exactly one character from the encoded flag each time a todo is added.
  const leakChar = leakIndex < flag.length ? flag[leakIndex] : "";
  leakIndex += 1;

  // debug field makes the leak discoverable via network inspection; UI ignores it.
  res.json({ message: "Todo added!", todo: cleaned, debug: leakChar, todos });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
