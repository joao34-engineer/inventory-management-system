import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'
import {
  createHazardZone,
  getHazardZones,
  getHazardZoneById,
  updateHazardZone,
  deleteHazardZone
} from '../controllers/hazardZoneController.ts'

const createHazardZoneSchema = z.object({
  name: z.string().min(3).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code').optional(),
})

const updateHazardZoneSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code').optional(),
})

const hazardZoneParamsSchema = z.object({
  id: z.string().uuid(),
})

const router = Router()

// Apply authentication to all hazard zone routes
router.use(authenticateToken)

// Hazard zone CRUD operations
/**
 * @openapi
 * /api/hazard-zones:
 *   get:
 *     tags:
 *       - Hazard Zones
 *     summary: Get all hazard zones
 *     description: Retrieve all hazard zones for the authenticated user
 *     responses:
 *       200:
 *         description: List of hazard zones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HazardZone'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getHazardZones)

/**
 * @openapi
 * /api/hazard-zones:
 *   post:
 *     tags:
 *       - Hazard Zones
 *     summary: Create a new hazard zone
 *     description: Create a new hazard zone with risk level categorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: High Voltage Area
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: 'Hex color code (Red=#dc2626 for high risk, Yellow=#eab308 for medium, Green=#16a34a for low)'
 *                 example: '#dc2626'
 *     responses:
 *       201:
 *         description: Hazard zone created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hazard zone created successfully
 *                 zone:
 *                   $ref: '#/components/schemas/HazardZone'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateBody(createHazardZoneSchema), createHazardZone)

/**
 * @openapi
 * /api/hazard-zones/{id}:
 *   get:
 *     tags:
 *       - Hazard Zones
 *     summary: Get hazard zone by ID
 *     description: Retrieve a specific hazard zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Hazard zone found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HazardZone'
 *       404:
 *         description: Hazard zone not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validateParams(hazardZoneParamsSchema), getHazardZoneById)

/**
 * @openapi
 * /api/hazard-zones/{id}:
 *   patch:
 *     tags:
 *       - Hazard Zones
 *     summary: Update a hazard zone
 *     description: Update an existing hazard zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *     responses:
 *       200:
 *         description: Hazard zone updated
 *       404:
 *         description: Hazard zone not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', validateParams(hazardZoneParamsSchema), validateBody(updateHazardZoneSchema), updateHazardZone)

/**
 * @openapi
 * /api/hazard-zones/{id}:
 *   delete:
 *     tags:
 *       - Hazard Zones
 *     summary: Delete a hazard zone
 *     description: Remove a hazard zone from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Hazard zone deleted
 *       404:
 *         description: Hazard zone not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', validateParams(hazardZoneParamsSchema), deleteHazardZone)

export default router
