// src/models/User.js
import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const User = {
  async findById(id) {
    const db = await getConnection();
    return db.get('SELECT id, username, fullname, role, created_at FROM users WHERE id = ?', [id]);
  },

  async findByUsername(username) {
    const db = await getConnection();
    return db.get('SELECT * FROM users WHERE username = ?', [username]);
  },

  async create(userData) {
    const db = await getConnection();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await db.run(`
      INSERT INTO users (username, password, fullname, role)
      VALUES (?, ?, ?, ?)
    `, [userData.username, hashedPassword, userData.fullname, userData.role || 'user']);
    return this.findById(result.lastID);
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  async list(skip = 0, limit = 100) {
    const db = await getConnection();
    return db.all(`
      SELECT id, username, fullname, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, skip]);
  }
};