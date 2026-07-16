// src/services/DashboardService.js
import { getConnection } from '../config/database.js';

export const DashboardService = {
  async getStats() {
    const db = await getConnection();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const total = await db.get('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
    const present = await db.get(
      'SELECT COUNT(DISTINCT employee_id) as count FROM attendance_logs WHERE timestamp >= ? AND timestamp <= ? AND type = "check_in"',
      [start.toISOString(), end.toISOString()]
    );
    const late = await db.get(
      'SELECT COUNT(*) as count FROM attendance_logs WHERE timestamp >= ? AND timestamp <= ? AND status = "late"',
      [start.toISOString(), end.toISOString()]
    );

    const presentIds = await db.all(
      'SELECT DISTINCT employee_id FROM attendance_logs WHERE timestamp >= ? AND timestamp <= ? AND type = "check_in"',
      [start.toISOString(), end.toISOString()]
    );

    let absent = 0;
    if (presentIds.length > 0) {
      const ids = presentIds.map(r => r.employee_id);
      const result = await db.get(
        `SELECT COUNT(*) as count FROM employees WHERE is_active = 1 AND id NOT IN (${ids.map(() => '?').join(',')})`,
        ids
      );
      absent = result?.count || 0;
    } else {
      const result = await db.get('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
      absent = result?.count || 0;
    }

    return {
      total_employees: total?.count || 0,
      present_today: present?.count || 0,
      late_today: late?.count || 0,
      absent_today: absent
    };
  },

  async getRecentActivities(limit = 10) {
    const db = await getConnection();
    const results = await db.all(`
      SELECT al.*, e.first_name, e.last_name, e.matricule, e.department
      FROM attendance_logs al
      JOIN employees e ON al.employee_id = e.id
      ORDER BY al.timestamp DESC
      LIMIT ?
    `, [limit]);

    return results.map(row => ({
      id: row.id,
      employee_name: `${row.first_name} ${row.last_name}`,
      employee_matricule: row.matricule,
      timestamp: row.timestamp,
      type: row.type,
      status: row.status,
      department: row.department
    }));
  }
};