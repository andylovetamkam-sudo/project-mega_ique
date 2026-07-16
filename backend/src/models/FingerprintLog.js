// src/models/FingerprintLog.js
import { getConnection } from '../config/database.js';

export const FingerprintLog = {
  async create(data) {
    const db = await getConnection();
    const result = await db.run(`
      INSERT INTO fingerprint_logs (
        name, fingerprint_id, timestamp, status, method, employee_id, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name,
      data.fingerprint_id,
      data.timestamp || new Date().toISOString(),
      data.status,
      data.method,
      data.employee_id || null,
      data.raw_data || null
    ]);
    return this.findById(result.lastID);
  },

  async findById(id) {
    const db = await getConnection();
    return db.get('SELECT * FROM fingerprint_logs WHERE id = ?', [id]);
  },

  async list({ skip = 0, limit = 100, employeeId = null, startDate = null, endDate = null } = {}) {
    const db = await getConnection();
    let query = 'SELECT * FROM fingerprint_logs WHERE 1=1';
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

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, skip);

    return db.all(query, params);
  }
};