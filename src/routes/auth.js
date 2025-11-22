const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = await User.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'email exists' });
  const user = await User.create({ email, password, name });
  res.status(201).json({ id: user.id, email: user.email, name: user.name });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });
  res.json({ token });
});

// POST /auth/logout (client should discard token; endpoint provided for symmetry)
router.post('/logout', (req, res) => res.json({ message: 'logout - discard token client-side' }));

module.exports = router;