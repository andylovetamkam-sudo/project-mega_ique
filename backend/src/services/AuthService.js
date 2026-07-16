// src/services/AuthService.js
import { getConnection } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

export const AuthService = {
  async login(username, password) {
    const db = await getConnection();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) throw new Error('Invalid credentials');

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = generateToken(user);
    return {
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
      },
      token
    };
  }
};