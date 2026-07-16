// src/controllers/EmployeeController.js
import { EmployeeService } from '../services/EmployeeService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const EmployeeController = {
  async getAll(req, res) {
    try {
      const { skip = 0, limit = 100, search, department } = req.query;
      const result = await EmployeeService.getAll({
        skip: parseInt(skip),
        limit: parseInt(limit),
        search,
        department
      });
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, error.message);
    }
  },

  async getById(req, res) {
    try {
      const employee = await EmployeeService.getById(req.params.id);
      sendSuccess(res, employee);
    } catch (error) {
      sendError(res, error.message, 404);
    }
  },

  async getByFingerprint(req, res) {
    try {
      const employee = await EmployeeService.getByFingerprint(req.params.fingerprintId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }
      sendSuccess(res, employee);
    } catch (error) {
      sendError(res, error.message);
    }
  },

  async create(req, res) {
    try {
      const employee = await EmployeeService.create(req.body);
      sendSuccess(res, employee, 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  },

  async update(req, res) {
    try {
      const employee = await EmployeeService.update(req.params.id, req.body);
      sendSuccess(res, employee);
    } catch (error) {
      sendError(res, error.message, 404);
    }
  },

  async delete(req, res) {
    try {
      const result = await EmployeeService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, error.message, 404);
    }
  }
};