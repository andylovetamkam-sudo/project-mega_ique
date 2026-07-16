// src/controllers/AttendanceController.js
import { AttendanceService } from '../services/AttendanceService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const AttendanceController = {
  async getToday(req, res) {
    try {
      const logs = await AttendanceService.getToday();
      sendSuccess(res, logs);
    } catch (error) {
      sendError(res, error.message);
    }
  },

  async create(req, res) {
    try {
      const { employee_id, type, status, fingerprint_id } = req.body;
      const attendance = await AttendanceService.create({
        employee_id,
        type,
        status,
        fingerprint_id
      });
      sendSuccess(res, attendance, 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  },

  async getAll(req, res) {
    try {
      const { skip = 0, limit = 100, employee_id, start_date, end_date, status } = req.query;
      const logs = await AttendanceService.getAll({
        skip: parseInt(skip),
        limit: parseInt(limit),
        employeeId: employee_id,
        startDate: start_date,
        endDate: end_date,
        status
      });
      sendSuccess(res, logs);
    } catch (error) {
      sendError(res, error.message);
    }
  }
};