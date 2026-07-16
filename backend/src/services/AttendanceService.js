// src/services/AttendanceService.js
import { getConnection } from '../config/database.js';

export const AttendanceService = {
  async getToday() {
    const db = await getConnection();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return db.all(
      'SELECT * FROM attendance_logs WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
      [start.toISOString(), end.toISOString()]
    );
  },

  async create(data) {
    const db = await getConnection();
    const { employee_id, type, status, fingerprint_id } = data;

    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employee_id]);
    if (!employee) throw new Error('Employee not found');

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const existing = await db.get(
      'SELECT * FROM attendance_logs WHERE employee_id = ? AND timestamp >= ? AND type = ?',
      [employee_id, start.toISOString(), type]
    );
    if (existing && type === 'check_in') return existing;

    const result = await db.run(`
      INSERT INTO attendance_logs (employee_id, timestamp, type, status, fingerprint_id)
      VALUES (?, ?, ?, ?, ?)
    `, [employee_id, new Date().toISOString(), type, status || 'on_time', fingerprint_id || null]);

    return db.get('SELECT * FROM attendance_logs WHERE id = ?', [result.lastID]);
  },

  async getAll(filters = {}) {
    const db = await getConnection();
    const { skip = 0, limit = 100, employeeId, startDate, endDate, status } = filters;
    
    let query = 'SELECT * FROM attendance_logs WHERE 1=1';
    const params = [];

    if (employeeId) { query += ' AND employee_id = ?'; params.push(employeeId); }
    if (startDate) { query += ' AND timestamp >= ?'; params.push(startDate); }
    if (endDate) { query += ' AND timestamp <= ?'; params.push(endDate); }
    if (status) { query += ' AND status = ?'; params.push(status); }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, skip);

    return db.all(query, params);
  }
};