// src/repositories/EmployeeRepository.js
import { getConnection } from '../config/database.js';
import { Employee } from '../models/Employee.js';

export class EmployeeRepository {
  async findById(id) {
    const db = await getConnection();
    const row = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    return row ? new Employee(row) : null;
  }

  async findByMatricule(matricule) {
    const db = await getConnection();
    const row = await db.get('SELECT * FROM employees WHERE matricule = ?', [matricule]);
    return row ? new Employee(row) : null;
  }

  async findByFingerprint(fingerprintId) {
    const db = await getConnection();
    const row = await db.get('SELECT * FROM employees WHERE fingerprint_id = ?', [fingerprintId]);
    return row ? new Employee(row) : null;
  }

  async findAll(filters = {}) {
    const db = await getConnection();
    const { skip = 0, limit = 100, search = null, department = null } = filters;
    
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR matricule LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    query += ' ORDER BY last_name LIMIT ? OFFSET ?';
    params.push(limit, skip);

    const rows = await db.all(query, params);
    return rows.map(row => new Employee(row));
  }

  async count(filters = {}) {
    const db = await getConnection();
    const { search = null, department = null } = filters;
    
    let query = 'SELECT COUNT(*) as count FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR matricule LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    const result = await db.get(query, params);
    return result?.count || 0;
  }

  async create(data) {
    const db = await getConnection();
    const result = await db.run(`
      INSERT INTO employees (
        first_name, last_name, matricule, department, email, role, fingerprint_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.firstName,
      data.lastName,
      data.matricule,
      data.department || null,
      data.email || null,
      data.role || 'employee',
      data.fingerprintId || null,
      data.isActive !== undefined ? data.isActive : true
    ]);
    return this.findById(result.lastID);
  }

  async update(id, data) {
    const db = await getConnection();
    const fields = [];
    const values = [];

    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      matricule: 'matricule',
      department: 'department',
      email: 'email',
      role: 'role',
      fingerprintId: 'fingerprint_id',
      isActive: 'is_active'
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.run(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  async delete(id) {
    const db = await getConnection();
    await db.run('DELETE FROM employees WHERE id = ?', [id]);
    return { success: true };
  }
}