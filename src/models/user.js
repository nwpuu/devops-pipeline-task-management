const bcrypt = require('bcrypt');

// In-memory user store for scaffold. Replace with DB in production.
const users = [];

async function create({ email, password, name }) {
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: `${Date.now()}`, email, password: hashed, name: name || '' };
  users.push(user);
  return { id: user.id, email: user.email, name: user.name, password: user.password };
}

async function findByEmail(email) {
  return users.find(u => u.email === email) || null;
}

module.exports = { create, findByEmail, findByEmail: findByEmail, createUser: create, findByEmail: findByEmail };