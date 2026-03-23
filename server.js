const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Hidden flag is ROT13-encoded so the leak is not obvious at first glance.
const flag = process.env.FLAG || "ZZQP{ebg13_vf_rnfl}";
// Index tracks which character to leak next; kept in memory only for simplicity.
let leakIndex = 0;
const todos = [];

// Global safety middleware: headers + light request throttling for abuse reduction.
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please slow down." }
  })
);
app.use(express.static(path.join(__dirname, "public")));

const addTodoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many todo submissions, try again shortly." }
});

app.get("/todos", (req, res) => {
  res.json({ todos });
});

app.post("/add-todo", addTodoLimiter, (req, res) => {
  const { todo } = req.body || {};
  if (!todo || typeof todo !== "string" || !todo.trim()) {
    return res.status(400).json({ message: "Todo cannot be empty", todos });
  }

  const cleaned = todo.trim();
  if (cleaned.length > 200) {
    return res
      .status(400)
      .json({ message: "Todo must be 200 characters or fewer", todos });
  }

  todos.push(cleaned);

  // Leak exactly one character from the encoded flag each time a todo is added.
  const leakChar = leakIndex < flag.length ? flag[leakIndex] : "";
  leakIndex += 1;

  // debug field makes the leak discoverable via network inspection; UI ignores it.
  res.json({ message: "Todo added!", todo: cleaned, debug: leakChar, todos });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected error, please try again later." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
