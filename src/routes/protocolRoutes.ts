import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'
import { 
  createProtocol, 
  getProtocols, 
  updateProtocol,
  deleteProtocol,
  getProtocolById,
  createComplianceLog,
  getComplianceLogs
} from '../controllers/protocolController.ts'

const createProtocolSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT_START', 'SHIFT_END']),
  targetCount: z.number().min(1),
  zoneIds: z.array(z.string()).optional()
})

const updateProtocolSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT_START', 'SHIFT_END']).optional(),
  targetCount: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  zoneIds: z.array(z.string()).optional()
})

const protocolParamsSchema = z.object({
  id: z.string().uuid(),
})

const createComplianceLogSchema = z.object({
  completionDate: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
})

const router = Router()

// Apply authentication to all protocol routes
router.use(authenticateToken)

// Protocol CRUD operations
/**
 * @openapi
 * /api/protocols:
 *   get:
 *     tags:
 *       - Protocols
 *     summary: Get all protocols
 *     description: Retrieve all safety inspection protocols for the authenticated user
 *     responses:
 *       200:
 *         description: List of protocols
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 protocols:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Protocol'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getProtocols)

/**
 * @openapi
 * /api/protocols:
 *   post:
 *     tags:
 *       - Protocols
 *     summary: Create a new protocol
 *     description: Create a new safety inspection protocol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - frequency
 *               - targetCount
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Morning PPE Inspection
 *               description:
 *                 type: string
 *                 example: Daily personal protective equipment check
 *               frequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, SHIFT_START, SHIFT_END]
 *                 example: SHIFT_START
 *               targetCount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               zoneIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Protocol created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Safety protocol created successfully
 *                 protocol:
 *                   $ref: '#/components/schemas/Protocol'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateBody(createProtocolSchema), createProtocol)

/**
 * @openapi
 * /api/protocols/{id}:
 *   get:
 *     tags:
 *       - Protocols
 *     summary: Get protocol by ID
 *     description: Retrieve a specific protocol by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Protocol ID
 *     responses:
 *       200:
 *         description: Protocol found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Protocol'
 *       404:
 *         description: Protocol not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validateParams(protocolParamsSchema), getProtocolById)

/**
 * @openapi
 * /api/protocols/{id}:
 *   patch:
 *     tags:
 *       - Protocols
 *     summary: Update a protocol
 *     description: Update an existing protocol's details
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
 *                 maxLength: 200
 *               description:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, SHIFT_START, SHIFT_END]
 *               targetCount:
 *                 type: integer
 *                 minimum: 1
 *               isActive:
 *                 type: boolean
 *               zoneIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Protocol updated
 *       404:
 *         description: Protocol not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', validateParams(protocolParamsSchema), validateBody(updateProtocolSchema), updateProtocol)

/**
 * @openapi
 * /api/protocols/{id}:
 *   delete:
 *     tags:
 *       - Protocols
 *     summary: Delete a protocol
 *     description: Remove a protocol from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Protocol deleted
 *       404:
 *         description: Protocol not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', validateParams(protocolParamsSchema), deleteProtocol)

// Compliance log operations
/**
 * @openapi
 * /api/protocols/{id}/compliance-logs:
 *   post:
 *     tags:
 *       - Protocols
 *     summary: Log a compliance check
 *     description: Record a completed safety inspection for a protocol
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Protocol ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completionDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the inspection was completed (defaults to now)
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 description: Technician observations
 *                 example: All PPE equipment in good condition
 *     responses:
 *       201:
 *         description: Compliance check recorded
 *       400:
 *         description: Invalid data (e.g., future date)
 *       404:
 *         description: Protocol not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/compliance-logs', 
  validateParams(protocolParamsSchema), 
  validateBody(createComplianceLogSchema), 
  createComplianceLog
)

/**
 * @openapi
 * /api/protocols/{id}/compliance-logs:
 *   get:
 *     tags:
 *       - Protocols
 *     summary: Get compliance logs
 *     description: Retrieve all compliance logs for a specific protocol
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Protocol ID
 *     responses:
 *       200:
 *         description: List of compliance logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       protocolId:
 *                         type: string
 *                         format: uuid
 *                       completionDate:
 *                         type: string
 *                         format: date-time
 *                       note:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Protocol not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/compliance-logs', 
  validateParams(protocolParamsSchema), 
  getComplianceLogs
)

export default router
