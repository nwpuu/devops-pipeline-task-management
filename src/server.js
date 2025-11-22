const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
app.use(express.json());

/* --- In-memory user "model" --- */
const users = [];
async function createUser({ email, password, name }) {
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: `${Date.now()}`, email, password: hashed, name: name || '' };
  users.push(user);
  return { id: user.id, email: user.email, name: user.name, password: user.password };
}
async function findByEmail(email) {
  return users.find(u => u.email === email) || null;
}

/* --- Auth middleware --- */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

/* --- Routes (register/login/logout) --- */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await findByEmail(email);
    if (existing) return res.status(409).json({ error: 'email exists' });
    const user = await createUser({ email, password, name });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/auth/logout', (req, res) => res.json({ message: 'logout - discard token client-side' }));

/* Example protected route */
app.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}
module.exports = app;