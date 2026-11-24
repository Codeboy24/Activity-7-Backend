const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];
const COLUMNS = "id, title, category, description, status";

// Send a 400 error with a clear message.
function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function notFound(id) {
  const error = new Error(`Record ${id} was not found.`);
  error.status = 404;
  return error;
}

// id must be a positive whole number written with digits only.
function parseId(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || !Number.isSafeInteger(Number(value))) {
    throw badRequest("The id must be a positive whole number.");
  }
  return Number(value);
}

// Check the four editable fields. Any client-supplied id is ignored.
function validateRecord(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("The request body must be a JSON object with title, category, description and status.");
  }
  const rules = [
    ["title", "Title", 3, 80],
    ["category", "Category", 2, 40],
    ["description", "Description", 5, 300]
  ];
  const record = {};
  for (const [field, label, min, max] of rules) {
    if (typeof body[field] !== "string") {
      throw badRequest(`${label} is required and must be text.`);
    }
    const value = body[field].trim();
    if (value.length < min || value.length > max) {
      throw badRequest(`${label} must have ${min} to ${max} characters.`);
    }
    record[field] = value;
  }
  if (typeof body.status !== "string" || !STATUSES.includes(body.status.trim())) {
    throw badRequest("Status must be one of: Pending, In progress, Completed.");
  }
  record.status = body.status.trim();
  return record;
}

// GET /api/records - all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/records/:id - one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]);
    if (result.rowCount === 0) throw notFound(id);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/records - create
router.post("/", async (req, res, next) => {
  try {
    const record = validateRecord(req.body);
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) " +
      `VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [record.title, record.category, record.description, record.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/records/:id - replace the four editable fields (does not create)
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const record = validateRecord(req.body);
    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
      `WHERE id = $5 RETURNING ${COLUMNS}`,
      [record.title, record.category, record.description, record.status, id]
    );
    if (result.rowCount === 0) throw notFound(id);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/records/:id - delete
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) throw notFound(id);
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
