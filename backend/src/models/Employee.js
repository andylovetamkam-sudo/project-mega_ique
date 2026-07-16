// src/models/Employee.js
export class Employee {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.matricule = data.matricule;
    this.department = data.department;
    this.email = data.email;
    this.role = data.role || 'employee';
    this.fingerprintId = data.fingerprint_id;
    this.isActive = data.is_active !== undefined ? data.is_active : true;
    this.createdAt = data.created_at;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      matricule: this.matricule,
      department: this.department,
      email: this.email,
      role: this.role,
      fingerprintId: this.fingerprintId,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}