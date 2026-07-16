// src/routes/employee.routes.js
import express from 'express';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(auth);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Liste des employés
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des employés
 */
router.get('/', EmployeeController.getAll);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Détails d'un employé
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détails de l'employé
 *       404:
 *         description: Employé non trouvé
 */
router.get('/:id', EmployeeController.getById);

/**
 * @swagger
 * /api/employees/fingerprint/{fingerprintId}:
 *   get:
 *     summary: Employé par empreinte
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fingerprintId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employé trouvé
 *       404:
 *         description: Employé non trouvé
 */
router.get('/fingerprint/:fingerprintId', EmployeeController.getByFingerprint);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Créer un employé
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - matricule
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               matricule: { type: string }
 *               department: { type: string }
 *               email: { type: string }
 *               role: { type: string }
 *               fingerprintId: { type: integer }
 *     responses:
 *       201:
 *         description: Employé créé
 *       400:
 *         description: Données invalides
 */
router.post('/', EmployeeController.create);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Modifier un employé
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               department: { type: string }
 *               email: { type: string }
 *               role: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Employé modifié
 *       404:
 *         description: Employé non trouvé
 */
router.put('/:id', EmployeeController.update);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Supprimer un employé
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employé supprimé
 *       404:
 *         description: Employé non trouvé
 */
router.delete('/:id', EmployeeController.delete);

export default router;