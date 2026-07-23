const express = require("express");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

const users = [];

function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = { id: randomUUID(), name, email, password: hashed, role: "user", createdAt: new Date().toISOString() };
    users.push(user);

    res.status(201).json(sanitize(user));
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/users (protected)
router.get("/", authenticate, (req, res) => {
  res.json({ users: users.map(sanitize), total: users.length });
});

// GET /api/users/:id (protected)
router.get("/:id", authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(sanitize(user));
});

// PUT /api/users/:id (protected)
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    if (users[idx].id !== req.user.id) {
      return res.status(403).json({ error: "Cannot modify another user" });
    }

    const { name, email, password } = req.body;
    if (name) users[idx].name = name;
    if (email) users[idx].email = email;
    if (password) users[idx].password = await bcrypt.hash(password, 12);

    res.json(sanitize(users[idx]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id (protected, admin only)
router.delete("/:id", authenticate, authorize("admin"), (req, res) => {
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  users.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
