// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChronosPresence API',
      version: '2.0.0',
      description: 'API de gestion des présences et pointages',
      contact: {
        name: 'ChronosPresence Team',
        email: 'support@chronos.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            first_name: { type: 'string', example: 'Jean' },
            last_name: { type: 'string', example: 'Dupont' },
            matricule: { type: 'string', example: 'EMP-001' },
            department: { type: 'string', example: 'IT' },
            email: { type: 'string', example: 'jean.dupont@company.com' },
            role: { type: 'string', enum: ['employee', 'manager', 'admin'] },
            fingerprint_id: { type: 'integer', example: 123 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            employee_id: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' },
            type: { type: 'string', enum: ['check_in', 'check_out'] },
            status: { type: 'string', enum: ['on_time', 'late', 'early'] },
            fingerprint_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        FingerprintLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'Jean Dupont' },
            fingerprint_id: { type: 'integer', example: 123 },
            timestamp: { type: 'string', format: 'date-time' },
            status: { type: 'string', example: 'granted' },
            method: { type: 'string', example: 'fingerprint' },
            employee_id: { type: 'integer', nullable: true },
            raw_data: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        FingerprintLogCreate: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Jean Dupont' },
            ID: { type: 'integer', example: 123 },
            date: { type: 'string', example: '16/07/2026 at 14:30:45' },
            Status: { type: 'string', example: 'granted' },
            method: { type: 'string', example: 'fingerprint' }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            total_employees: { type: 'integer' },
            present_today: { type: 'integer' },
            late_today: { type: 'integer' },
            absent_today: { type: 'integer' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentification' },
      { name: 'Employees', description: 'Gestion des employés' },
      { name: 'Attendance', description: 'Gestion des pointages' },
      { name: 'Dashboard', description: 'Tableau de bord' },
      { name: 'Fingerprint', description: 'Empreintes digitales (ESP32)' }
    ],
    paths: {
      // ============ AUTH ============
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Connexion utilisateur',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', example: 'admin123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Connexion réussie',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/Employee' },
                          token: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Identifiants invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },

      // ============ EMPLOYEES ============
      '/api/employees': {
        get: {
          tags: ['Employees'],
          summary: 'Liste des employés',
          parameters: [
            { in: 'query', name: 'skip', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'department', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Liste des employés',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          employees: { type: 'array', items: { $ref: '#/components/schemas/Employee' } },
                          total: { type: 'integer' },
                          skip: { type: 'integer' },
                          limit: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Employees'],
          summary: 'Créer un employé',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['first_name', 'last_name', 'matricule'],
                  properties: {
                    first_name: { type: 'string', example: 'Jean' },
                    last_name: { type: 'string', example: 'Dupont' },
                    matricule: { type: 'string', example: 'EMP-001' },
                    department: { type: 'string', example: 'IT' },
                    email: { type: 'string', example: 'jean.dupont@company.com' },
                    role: { type: 'string', enum: ['employee', 'manager', 'admin'] },
                    fingerprint_id: { type: 'integer', example: 123 }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Employé créé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Employee' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },

      '/api/employees/{id}': {
        get: {
          tags: ['Employees'],
          summary: 'Détails d\'un employé',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Détails de l\'employé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Employee' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Employé non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Employees'],
          summary: 'Modifier un employé',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                    department: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['employee', 'manager', 'admin'] },
                    is_active: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Employé modifié',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Employee' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Employé non trouvé'
            }
          }
        },
        delete: {
          tags: ['Employees'],
          summary: 'Supprimer un employé',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Employé supprimé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object', properties: { success: { type: 'boolean' } } }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Employé non trouvé'
            }
          }
        }
      },

      '/api/employees/fingerprint/{fingerprintId}': {
        get: {
          tags: ['Employees'],
          summary: 'Récupérer un employé par empreinte',
          parameters: [
            { in: 'path', name: 'fingerprintId', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Employé trouvé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Employee' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Employé non trouvé'
            }
          }
        }
      },

      // ============ ATTENDANCE ============
      '/api/attendance': {
        get: {
          tags: ['Attendance'],
          summary: 'Liste des pointages',
          parameters: [
            { in: 'query', name: 'skip', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
            { in: 'query', name: 'employee_id', schema: { type: 'integer' } },
            { in: 'query', name: 'start_date', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'end_date', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['on_time', 'late', 'early'] } }
          ],
          responses: {
            200: {
              description: 'Liste des pointages',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Attendance'],
          summary: 'Créer un pointage',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['employee_id', 'type'],
                  properties: {
                    employee_id: { type: 'integer', example: 1 },
                    type: { type: 'string', enum: ['check_in', 'check_out'] },
                    status: { type: 'string', enum: ['on_time', 'late', 'early'] },
                    fingerprint_id: { type: 'integer', example: 123 }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Pointage créé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Attendance' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Employé non trouvé'
            }
          }
        }
      },

      '/api/attendance/today': {
        get: {
          tags: ['Attendance'],
          summary: 'Pointages du jour',
          responses: {
            200: {
              description: 'Pointages du jour',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ============ DASHBOARD ============
      '/api/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Statistiques du tableau de bord',
          responses: {
            200: {
              description: 'Statistiques',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/DashboardStats' }
                    }
                  }
                }
              }
            }
          }
        }
      },

      '/api/dashboard/recent-activities': {
        get: {
          tags: ['Dashboard'],
          summary: 'Activités récentes',
          parameters: [
            { in: 'query', name: 'limit', schema: { type: 'integer' }, description: 'Nombre d\'activités' }
          ],
          responses: {
            200: {
              description: 'Activités récentes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            employee_name: { type: 'string' },
                            employee_matricule: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            type: { type: 'string', enum: ['check_in', 'check_out'] },
                            status: { type: 'string', enum: ['on_time', 'late', 'early'] },
                            department: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ============ FINGERPRINT (ESP32) ============
      '/api/fingerprint/log': {
        post: {
          tags: ['Fingerprint'],
          summary: 'Recevoir un log d\'empreinte (ESP32)',
          description: 'Endpoint public pour recevoir les données du capteur d\'empreinte ESP32',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Jean Dupont' },
                    ID: { type: 'integer', example: 123 },
                    date: { type: 'string', example: '16/07/2026 at 14:30:45' },
                    Status: { type: 'string', example: 'granted' },
                    method: { type: 'string', example: 'fingerprint' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Log enregistré avec succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      log_id: { type: 'integer' },
                      employee: { $ref: '#/components/schemas/Employee' },
                      attendance: { $ref: '#/components/schemas/Attendance' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },

      // ============ FINGERPRINT LOGS (GET) ============
      '/api/fingerprint/logs': {
        get: {
          tags: ['Fingerprint'],
          summary: 'Récupérer tous les logs d\'empreinte',
          description: 'Retourne la liste complète des logs d\'empreinte enregistrés par l\'ESP32',
          parameters: [
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 }, description: 'Nombre de logs à retourner' },
            { in: 'query', name: 'skip', schema: { type: 'integer', default: 0 }, description: 'Nombre de logs à sauter' }
          ],
          responses: {
            200: {
              description: 'Liste des logs d\'empreinte',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/FingerprintLog' }
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      skip: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      },

      '/api/fingerprint/logs/{id}': {
        get: {
          tags: ['Fingerprint'],
          summary: 'Récupérer un log d\'empreinte par ID',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'ID du log' }
          ],
          responses: {
            200: {
              description: 'Détails du log',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/FingerprintLog' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Log non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },

      '/api/fingerprint/logs/employee/{employeeId}': {
        get: {
          tags: ['Fingerprint'],
          summary: 'Récupérer les logs d\'empreinte d\'un employé',
          parameters: [
            { in: 'path', name: 'employeeId', required: true, schema: { type: 'integer' }, description: 'ID de l\'employé' },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'skip', schema: { type: 'integer', default: 0 } }
          ],
          responses: {
            200: {
              description: 'Logs de l\'employé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/FingerprintLog' }
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      skip: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

export const specs = swaggerJsdoc(options);