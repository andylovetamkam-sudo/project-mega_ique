// src/routes/index.js
import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { AttendanceController } from '../controllers/AttendanceController.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { auth } from '../middleware/auth.js';
import { getConnection } from '../config/database.js';

const router = express.Router();

// ============ AUTH ============
router.post('/auth/login', AuthController.login);

// ============ EMPLOYEES ============
router.get('/employees', auth, EmployeeController.getAll);
router.get('/employees/:id', auth, EmployeeController.getById);
router.get('/employees/fingerprint/:fingerprintId', auth, EmployeeController.getByFingerprint);
router.post('/employees', auth, EmployeeController.create);
router.put('/employees/:id', auth, EmployeeController.update);
router.delete('/employees/:id', auth, EmployeeController.delete);

// ============ ATTENDANCE ============
router.get('/attendance/today', auth, AttendanceController.getToday);
router.get('/attendance', auth, AttendanceController.getAll);
router.post('/attendance', auth, AttendanceController.create);

// ============ DASHBOARD ============
router.get('/dashboard/stats', auth, DashboardController.getStats);
router.get('/dashboard/recent-activities', auth, DashboardController.getRecentActivities);

// ============ FINGERPRINT (ESP32) - POST ============
router.post('/fingerprint/log', async (req, res) => {
  try {
    console.log('📥 Données reçues de l\'ESP32:', req.body);
    
    const { name, ID, date, Status, method } = req.body;
    
    if (!name && !ID) {
      return res.status(400).json({ success: false, error: 'Name or ID required' });
    }
    
    const db = await getConnection();
    const fingerprintId = parseInt(ID) || 0;
    const cleanStatus = (Status || 'granted').trim();
    const cleanMethod = (method || 'fingerprint').trim();
    const cleanName = (name || 'Inconnu').trim();
    
    let timestamp = new Date();
    if (date) {
      try {
        const parts = date.split(' at ');
        if (parts.length === 2) {
          const dateParts = parts[0].split('/');
          const timeParts = parts[1].split(':');
          timestamp = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1]),
            parseInt(timeParts[2] || 0)
          );
        }
      } catch (e) {
        timestamp = new Date();
      }
    }
    
    let employee = await db.get(
      'SELECT * FROM employees WHERE fingerprint_id = ?', 
      [fingerprintId]
    );
    
    if (!employee && cleanName !== 'Inconnu') {
      employee = await db.get(
        'SELECT * FROM employees WHERE first_name LIKE ? OR last_name LIKE ?',
        [`%${cleanName}%`, `%${cleanName}%`]
      );
    }
    
    const logResult = await db.run(`
      INSERT INTO fingerprint_logs 
      (name, fingerprint_id, timestamp, status, method, employee_id, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      cleanName, 
      fingerprintId, 
      timestamp.toISOString(), 
      cleanStatus, 
      cleanMethod, 
      employee?.id || null,
      JSON.stringify(req.body)
    ]);
    
    const logId = logResult.lastID;
    let attendance = null;
    
    if (employee) {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const existing = await db.get(`
        SELECT * FROM attendance_logs 
        WHERE employee_id = ? AND timestamp >= ? AND timestamp <= ? AND type = 'check_in'
      `, [employee.id, start.toISOString(), end.toISOString()]);
      
      if (!existing) {
        const attResult = await db.run(`
          INSERT INTO attendance_logs 
          (employee_id, timestamp, type, status, fingerprint_id)
          VALUES (?, ?, ?, ?, ?)
        `, [
          employee.id, 
          timestamp.toISOString(), 
          'check_in', 
          cleanStatus.toLowerCase() === 'granted' ? 'on_time' : 'late',
          fingerprintId
        ]);
        attendance = await db.get('SELECT * FROM attendance_logs WHERE id = ?', [attResult.lastID]);
      }
    }
    
    res.json({
      success: true,
      message: employee ? '✅ Pointage enregistré' : '⚠️ Empreinte enregistrée (employé non trouvé)',
      log_id: logId,
      employee: employee ? {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        matricule: employee.matricule,
        department: employee.department
      } : null,
      attendance: attendance || null
    });
    
  } catch (error) {
    console.error('❌ Erreur fingerprint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ FINGERPRINT (ESP32) - GET ============
// Récupérer tous les logs d'empreinte
router.get('/fingerprint/logs', async (req, res) => {
  try {
    const db = await getConnection();
    const { limit = 50, skip = 0 } = req.query;
    
    // Récupérer les logs avec les informations de l'employé si disponible
    const logs = await db.all(`
      SELECT 
        fl.*,
        e.first_name,
        e.last_name,
        e.matricule,
        e.department
      FROM fingerprint_logs fl
      LEFT JOIN employees e ON fl.employee_id = e.id
      ORDER BY fl.timestamp DESC 
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(skip)]);
    
    const total = await db.get('SELECT COUNT(*) as count FROM fingerprint_logs');
    
    res.json({
      success: true,
      data: logs,
      total: total?.count || 0,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('❌ Erreur récupération logs empreinte:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer un log d'empreinte par ID
router.get('/fingerprint/logs/:id', async (req, res) => {
  try {
    const db = await getConnection();
    const log = await db.get(`
      SELECT 
        fl.*,
        e.first_name,
        e.last_name,
        e.matricule,
        e.department
      FROM fingerprint_logs fl
      LEFT JOIN employees e ON fl.employee_id = e.id
      WHERE fl.id = ?
    `, [req.params.id]);
    
    if (!log) {
      return res.status(404).json({ success: false, error: 'Log not found' });
    }
    
    res.json({ success: true, data: log });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les logs d'empreinte d'un employé spécifique
router.get('/fingerprint/logs/employee/:employeeId', async (req, res) => {
  try {
    const db = await getConnection();
    const { limit = 20, skip = 0 } = req.query;
    
    const logs = await db.all(`
      SELECT * FROM fingerprint_logs 
      WHERE employee_id = ?
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `, [req.params.employeeId, parseInt(limit), parseInt(skip)]);
    
    const total = await db.get(
      'SELECT COUNT(*) as count FROM fingerprint_logs WHERE employee_id = ?',
      [req.params.employeeId]
    );
    
    res.json({
      success: true,
      data: logs,
      total: total?.count || 0,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;