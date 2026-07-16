// src/services/EmployeeService.js
import { EmployeeRepository } from '../repositories/EmployeeRepository.js';

export class EmployeeService {
  constructor() {
    this.repository = new EmployeeRepository();
  }

  async getAllEmployees(filters = {}) {
    const { skip = 0, limit = 100, search = null, department = null } = filters;
    
    const [employees, total] = await Promise.all([
      this.repository.findAll({ skip, limit, search, department }),
      this.repository.count({ search, department })
    ]);

    return {
      employees: employees.map(emp => emp.toJSON()),
      total,
      skip: parseInt(skip),
      limit: parseInt(limit)
    };
  }

  async getEmployeeById(id) {
    const employee = await this.repository.findById(id);
    if (!employee) throw new Error('Employee not found');
    return employee.toJSON();
  }

  async getEmployeeByFingerprint(fingerprintId) {
    const employee = await this.repository.findByFingerprint(fingerprintId);
    return employee ? employee.toJSON() : null;
  }

  async createEmployee(data) {
    const existing = await this.repository.findByMatricule(data.matricule);
    if (existing) throw new Error('Matricule already exists');

    const employee = await this.repository.create(data);
    return employee.toJSON();
  }

  async updateEmployee(id, data) {
    const employee = await this.repository.update(id, data);
    if (!employee) throw new Error('Employee not found');
    return employee.toJSON();
  }

  async deleteEmployee(id) {
    const employee = await this.repository.findById(id);
    if (!employee) throw new Error('Employee not found');
    await this.repository.delete(id);
    return { success: true };
  }
}