import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { hazardZones } from '../db/schema.ts'
import { eq, desc } from 'drizzle-orm'

/**
 * Creates a new hazard zone for categorizing protocols
 */
export const createHazardZone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, color } = req.body

    // Validate color is a valid hex code
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (color && !hexColorRegex.test(color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex code (e.g., #dc2626)' })
    }

    const [newZone] = await db.insert(hazardZones).values({
      name,
      color: color || '#16a34a', // Default to green (low risk)
    }).returning()

    res.status(201).json(newZone)
  } catch (e: any) {
    // Check for unique constraint violation
    if (e.code === '23505' || e.cause?.code === '23505') {
      return res.status(409).json({ error: 'Hazard zone with this name already exists' })
    }
    console.error('Create hazard zone error:', e)
    res.status(500).json({ error: 'Failed to create hazard zone' })
  }
}

/**
 * Retrieves all hazard zones
 */
export const getHazardZones = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const zones = await db.query.hazardZones.findMany({
      orderBy: [desc(hazardZones.createdAt)]
    })

    res.json(zones)
  } catch (e) {
    console.error('Get hazard zones error:', e)
    res.status(500).json({ error: 'Failed to fetch hazard zones' })
  }
}

/**
 * Retrieves a single hazard zone by ID
 */
export const getHazardZoneById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id

    const zone = await db.query.hazardZones.findFirst({
      where: eq(hazardZones.id, id),
      with: {
        protocolZones: {
          with: {
            protocol: true,
          }
        }
      }
    })

    if (!zone) {
      return res.status(404).json({ error: 'Hazard zone not found' })
    }

    const zoneWithProtocols = {
      ...zone,
      protocols: zone.protocolZones.map((pz) => pz.protocol),
      protocolZones: undefined,
    }

    res.json(zoneWithProtocols)
  } catch (e) {
    console.error('Get hazard zone error:', e)
    res.status(500).json({ error: 'Failed to fetch hazard zone' })
  }
}

/**
 * Updates a hazard zone
 */
export const updateHazardZone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id
    const { name, color } = req.body

    // Validate color if provided
    if (color) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
      if (!hexColorRegex.test(color)) {
        return res.status(400).json({ error: 'Invalid color format. Use hex code (e.g., #dc2626)' })
      }
    }

    const [updatedZone] = await db
      .update(hazardZones)
      .set({ 
        ...(name && { name }),
        ...(color && { color }),
        updatedAt: new Date() 
      })
      .where(eq(hazardZones.id, id))
      .returning()

    if (!updatedZone) {
      return res.status(404).json({ error: 'Hazard zone not found' })
    }

    res.json(updatedZone)
  } catch (e: any) {
    if (e.code === '23505' || e.cause?.code === '23505') {
      return res.status(409).json({ error: 'Hazard zone with this name already exists' })
    }
    console.error('Update hazard zone error:', e)
    res.status(500).json({ error: 'Failed to update hazard zone' })
  }
}

/**
 * Deletes a hazard zone
 */
export const deleteHazardZone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id

    const [deleted] = await db
      .delete(hazardZones)
      .where(eq(hazardZones.id, id))
      .returning()

    if (!deleted) {
      return res.status(404).json({ error: 'Hazard zone not found' })
    }

    res.json({ message: 'Hazard zone deleted successfully' })
  } catch (e) {
    console.error('Delete hazard zone error:', e)
    res.status(500).json({ error: 'Failed to delete hazard zone' })
  }
}
