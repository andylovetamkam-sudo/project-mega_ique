// src/controllers/AuthController.js
import { AuthService } from '../services/AuthService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const AuthController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return sendError(res, 'Username and password required', 400);
      }
      const result = await AuthService.login(username, password);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, error.message, 401);
    }
  }
};