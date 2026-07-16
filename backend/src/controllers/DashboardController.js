// src/controllers/DashboardController.js
import { DashboardService } from '../services/DashboardService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const DashboardController = {
  async getStats(req, res) {
    try {
      const stats = await DashboardService.getStats();
      sendSuccess(res, stats);
    } catch (error) {
      sendError(res, error.message);
    }
  },

  async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await DashboardService.getRecentActivities(limit);
      sendSuccess(res, activities);
    } catch (error) {
      sendError(res, error.message);
    }
  }
};