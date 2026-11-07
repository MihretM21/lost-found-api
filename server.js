const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

// Connection to MySQL (change the password to yours)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "YOUR_MYSQL_PASSWORD",
  database: "lost_found",
  dateStrings: true, // dates come back as "2026-11-05", not a long date object
});

// ---------- helpers ----------

// Turns MySQL's 0/1 into true/false
function formatItem(row) {
  return { ...row, claimed: Boolean(row.claimed) };
}

// The id in the URL must be a whole number bigger than 0
function parseId(text) {
  const id = Number(text);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Checks the data a client sends. Returns an error text, or null if all is fine.
function validateItem(body) {
  if (!body || typeof body !== "object") return "Request body is required";

  const textFields = ["name", "category", "location_found"];
  for (const field of textFields) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return `${field} is required and must be text`;
    }
  }

  if (
    typeof body.date_found !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.date_found) ||
    isNaN(Date.parse(body.date_found))
  ) {
    return "date_found is required and must look like 2026-11-05";
  }

  if (body.claimed !== undefined && typeof body.claimed !== "boolean") {
    return "claimed must be true or false";
  }

  return null;
}

// ---------- routes ----------

app.get("/", (req, res) => {
  res.send("Lost and Found API");
});

// 1. Get all items
app.get("/items", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM items ORDER BY id");
    return res.status(200).json(rows.map(formatItem));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 2. Get one item
app.get("/items/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null)
    return res.status(400).json({ error: "id must be a positive number" });

  try {
    const [rows] = await pool.query("SELECT * FROM items WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    return res.status(200).json(formatItem(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 3. Add a new item
app.post("/items", async (req, res) => {
  const problem = validateItem(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const {
    name,
    category,
    location_found,
    date_found,
    claimed = false,
  } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO items (name, category, location_found, date_found, claimed) VALUES (?, ?, ?, ?, ?)",
      [
        name.trim(),
        category.trim(),
        location_found.trim(),
        date_found,
        claimed,
      ],
    );
    const [rows] = await pool.query("SELECT * FROM items WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(formatItem(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 4. Update an item
app.put("/items/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null)
    return res.status(400).json({ error: "id must be a positive number" });

  const problem = validateItem(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const {
    name,
    category,
    location_found,
    date_found,
    claimed = false,
  } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE items SET name = ?, category = ?, location_found = ?, date_found = ?, claimed = ? WHERE id = ?",
      [
        name.trim(),
        category.trim(),
        location_found.trim(),
        date_found,
        claimed,
        id,
      ],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Item not found" });

    const [rows] = await pool.query("SELECT * FROM items WHERE id = ?", [id]);
    return res.status(200).json(formatItem(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 5. Delete an item
app.delete("/items/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null)
    return res.status(400).json({ error: "id must be a positive number" });

  try {
    const [result] = await pool.query("DELETE FROM items WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Item not found" });
    return res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Bad JSON in the request body gives a clean 400
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
