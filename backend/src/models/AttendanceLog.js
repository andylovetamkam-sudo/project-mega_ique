// src/models/AttendanceLog.js
import { getConnection } from '../config/database.js';

export const AttendanceLog = {
  async create(data) {
    const db = await getConnection();
    const result = await db.run(`
      INSERT INTO attendance_logs (
        employee_id, timestamp, type, status, fingerprint_id
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      data.employee_id,
      data.timestamp || new Date().toISOString(),
      data.type,
      data.status || 'on_time',
      data.fingerprint_id || null
    ]);
    return this.findById(result.lastID);
  },

  async findById(id) {
    const db = await getConnection();
    return db.get('SELECT * FROM attendance_logs WHERE id = ?', [id]);
  },

  async list({ skip = 0, limit = 100, employeeId = null, startDate = null, endDate = null, status = null } = {}) {
    const db = await getConnection();
    let query = 'SELECT * FROM attendance_logs WHERE 1=1';
    const params = [];

    if (employeeId) {
      query += ' AND employee_id = ?';
      params.push(employeeId);
    }

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, skip);

    return db.all(query, params);
  },

  async getToday() {
    const db = await getConnection();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return db.all(`
      SELECT * FROM attendance_logs
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
    `, [start.toISOString(), end.toISOString()]);
  },

  async getEmployeeToday(employeeId) {
    const db = await getConnection();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return db.all(`
      SELECT * FROM attendance_logs
      WHERE employee_id = ? AND timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
    `, [employeeId, start.toISOString(), end.toISOString()]);
  }
};