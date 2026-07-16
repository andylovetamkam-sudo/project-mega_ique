// src/config/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = '/app/data/presence.db';

let dbInstance = null;

export async function getConnection() {
  if (dbInstance) return dbInstance;

  try {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    await dbInstance.exec('PRAGMA foreign_keys = ON;');
    await initTables();
    console.log('✅ Database connected');

    return dbInstance;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

async function initTables() {
  const db = dbInstance;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullname TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      matricule TEXT UNIQUE NOT NULL,
      department TEXT,
      email TEXT,
      role TEXT DEFAULT 'employee',
      fingerprint_id INTEGER UNIQUE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS fingerprint_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fingerprint_id INTEGER NOT NULL,
      timestamp DATETIME NOT NULL,
      status TEXT NOT NULL,
      method TEXT NOT NULL,
      employee_id INTEGER,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL CHECK(type IN ('check_in', 'check_out')),
      status TEXT DEFAULT 'on_time' CHECK(status IN ('on_time', 'late', 'early')),
      fingerprint_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS presences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      room TEXT,
      is_present BOOLEAN DEFAULT 1,
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT,
      age INTEGER NOT NULL,
      authorisation BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin par défaut
  const admin = await db.get('SELECT * FROM users WHERE username = "admin"');
  if (!admin) {
    try {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (username, password, fullname, role)
        VALUES ('admin', ?, 'Administrateur', 'admin')
      `, [hashedPassword]);
      console.log('✅ Admin created: admin / admin123');
    } catch (error) {
      console.error('❌ Admin creation error:', error);
    }
  }

  console.log('✅ Tables initialized');
}

export default { getConnection };


// src/config/database.js - La table existe déjà
await db.exec(`
  CREATE TABLE IF NOT EXISTS fingerprint_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    fingerprint_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL,
    status TEXT NOT NULL,
    method TEXT NOT NULL,
    employee_id INTEGER,
    raw_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
  )
`);