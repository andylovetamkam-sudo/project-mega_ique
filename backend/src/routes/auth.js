// src/routes/auth.js
import express from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        detail: 'Username and password are required'
      });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        detail: 'Invalid credentials'
      });
    }

    const isValid = await User.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        detail: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      detail: 'Internal server error'
    });
  }
});

export default router;