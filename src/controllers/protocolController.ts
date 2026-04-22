import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { protocols, complianceLogs, protocolZones, hazardZones } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

/**
 * Creates a new safety inspection protocol
 * Safety officers can define recurring compliance checks
 */
export const createProtocol = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description, frequency, targetCount, zoneIds } = req.body
    
    const result = await db.transaction(async (tx) => {
      const [newProtocol] = await tx.insert(protocols).values({
        userId: req.user.id,
        name,
        description,
        frequency,
        targetCount,
      })
      .returning()
      
      let zones = []
      if (zoneIds && zoneIds.length > 0) {
        const protocolZoneValues = zoneIds.map((zoneId) => ({ 
          protocolId: newProtocol.id,
          zoneId
        }))

        await tx.insert(protocolZones).values(protocolZoneValues)
        
        // Fetch the zones to return in response
        zones = await tx.query.hazardZones.findMany({
          where: inArray(hazardZones.id, zoneIds)
        })
      }
      
      return { ...newProtocol, zones }
    })

    res.status(201).json(result)
    
  } catch (e) {
    console.error('Create protocol error:', e)
    res.status(500).json({ error: 'Failed to create protocol' })
  }
}

/**
 * Retrieves all safety protocols for the authenticated user
 * Returns protocols with their associated hazard zones
 */
export const getProtocols = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userProtocolsWithZones = await db.query.protocols.findMany({
      where: eq(protocols.userId, req.user.id),
      with: {
        protocolZones: {
          with: {
            hazardZone: true,
          }
        }
      },
      orderBy: [desc(protocols.createdAt)]
    })

    const protocolsWithZones = userProtocolsWithZones.map((protocol) => ({ 
      ...protocol,
      zones: protocol.protocolZones.map((pz) => pz.hazardZone),
      protocolZones: undefined,
    }))

    res.json(protocolsWithZones)
  } catch (e) {
    console.error('Get protocols error:', e)
    res.status(500).json({ error: 'Failed to fetch protocols' })
  }
}

/**
 * Updates an existing safety protocol
 * Only the protocol owner can update it
 */
export const updateProtocol = async (
  req: AuthenticatedRequest, 
  res: Response
) => {
  try {
    const id = req.params.id
    const { zoneIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      const [updatedProtocol] = await tx
        .update(protocols)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(
          eq(protocols.id, id), 
          eq(protocols.userId, req.user.id)
        ))
        .returning()
      
      if (!updatedProtocol) {
        return null
      }

      let zones = []
      if (zoneIds !== undefined) {
        await tx.delete(protocolZones).where(eq(protocolZones.protocolId, id))

        if (zoneIds.length > 0) {
          const protocolZoneValues = zoneIds.map((zoneId) => ({
            protocolId: id,
            zoneId,
          }))

          await tx.insert(protocolZones).values(protocolZoneValues)
          
          // Fetch zones to return in response
          zones = await tx.query.hazardZones.findMany({
            where: inArray(hazardZones.id, zoneIds)
          })
        }
      } else {
        // If zoneIds not provided, fetch existing zones
        const existingZones = await tx.query.protocolZones.findMany({
          where: eq(protocolZones.protocolId, id),
          with: { hazardZone: true }
        })
        zones = existingZones.map(pz => pz.hazardZone)
      }
      
      return { ...updatedProtocol, zones }
    })

    if (!result) {
      return res.status(404).json({ error: 'Protocol not found or access denied' })
    }

    res.json(result)
  } catch (e) {
    console.error('Update protocol error:', e)
    res.status(500).json({ error: 'Failed to update protocol' })
  }
}

/**
 * Deletes a safety protocol
 * Cascade deletes all associated compliance logs
 */
export const deleteProtocol = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id

    // First check if protocol exists and belongs to user
    const [existing] = await db
      .select()
      .from(protocols)
      .where(and(
        eq(protocols.id, id),
        eq(protocols.userId, req.user.id)
      ))
      .limit(1)

    if (!existing) {
      return res.status(404).json({ error: 'Protocol not found or access denied' })
    }

    // Then delete it
    await db
      .delete(protocols)
      .where(eq(protocols.id, id))

    res.json({ message: 'Protocol deleted successfully' })
  } catch (e) {
    console.error('Delete protocol error:', e)
    res.status(500).json({ error: 'Failed to delete protocol' })
  }
}

/**
 * Retrieves a single protocol by ID
 */
export const getProtocolById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id

    const protocol = await db.query.protocols.findFirst({
      where: and(
        eq(protocols.id, id),
        eq(protocols.userId, req.user.id)
      ),
      with: {
        protocolZones: {
          with: {
            hazardZone: true,
          }
        },
        complianceLogs: {
          orderBy: [desc(complianceLogs.completionDate)],
          limit: 10,
        }
      }
    })

    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' })
    }

    const protocolWithZones = {
      ...protocol,
      zones: protocol.protocolZones.map((pz) => pz.hazardZone),
      protocolZones: undefined,
    }

    res.json(protocolWithZones)
  } catch (e) {
    console.error('Get protocol error:', e)
    res.status(500).json({ error: 'Failed to fetch protocol' })
  }
}

/**
 * Creates a compliance log for a protocol
 * Records that a safety check was completed
 */
export const createComplianceLog = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const protocolId = req.params.id
    const { completionDate, note } = req.body

    // Verify protocol exists and belongs to user
    const protocol = await db.query.protocols.findFirst({
      where: and(
        eq(protocols.id, protocolId),
        eq(protocols.userId, req.user.id)
      )
    })

    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' })
    }

    // Validate completion date is not in the future
    const logDate = completionDate ? new Date(completionDate) : new Date()
    if (logDate > new Date()) {
      return res.status(400).json({ error: 'Cannot log future compliance checks' })
    }

    const [newLog] = await db.insert(complianceLogs).values({
      protocolId,
      completionDate: logDate,
      note,
    }).returning()

    res.status(201).json(newLog)
  } catch (e) {
    console.error('Create compliance log error:', e)
    res.status(500).json({ error: 'Failed to create compliance log' })
  }
}

/**
 * Retrieves all compliance logs for a protocol
 */
export const getComplianceLogs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const protocolId = req.params.id

    // Verify protocol exists and belongs to user
    const protocol = await db.query.protocols.findFirst({
      where: and(
        eq(protocols.id, protocolId),
        eq(protocols.userId, req.user.id)
      )
    })

    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' })
    }

    const logs = await db.query.complianceLogs.findMany({
      where: eq(complianceLogs.protocolId, protocolId),
      orderBy: [desc(complianceLogs.completionDate)],
    })

    res.json(logs)
  } catch (e) {
    console.error('Get compliance logs error:', e)
    res.status(500).json({ error: 'Failed to fetch compliance logs' })
  }
}
