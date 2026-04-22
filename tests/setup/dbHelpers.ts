import { db } from '../../src/db/connection.ts'
import { 
  users, 
  protocols, 
  complianceLogs, 
  hazardZones, 
  type NewUser, 
  type NewProtocol, 
  type NewHazardZone,
  protocolZones 
} from '../../src/db/schema.ts'
import { hashPassword } from '../../src/utils/passwords.ts'
import { generateToken } from '../../src/utils/jwt.ts'

export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    username: `test-${Date.now()}-${Math.random()}`,
    password: 'SafetyFirst123!',
    firstName: 'John',
    lastName: 'Doe',
    ...userData,
  }

  const hashedPassword = await hashPassword(defaultData.password)
  const [user] = await db.insert(users).values({
    ...defaultData,
    password: hashedPassword,
  })
  .returning()

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  return { token, user, rawPassword: defaultData.password }
}

export const createTestProtocol = async (userId: string, protocolData: Partial<NewProtocol & { zoneIds?: string[] }> = {}) => {
  const { zoneIds, ...defaultData } = { 
    name: `Test Protocol ${Date.now()}`,
    description: 'A test safety protocol',
    frequency: 'DAILY',
    targetCount: 1,
    ...protocolData,
  }

  const [protocol] = await db.insert(protocols).values({
    userId,
    ...defaultData,
  })
  .returning()

  // Associate with zones if provided
  if (zoneIds && zoneIds.length > 0) {
    await db.insert(protocolZones).values(
      zoneIds.map(zoneId => ({
        protocolId: protocol.id,
        zoneId,
      }))
    )
  }

  return protocol 
}

export const createTestHazardZone = async (zoneData: Partial<NewHazardZone> = {}) => {
  const defaultData = {
    name: `Test Zone ${Date.now()}`,
    color: '#16a34a',
    ...zoneData,
  }

  const [zone] = await db.insert(hazardZones).values(defaultData).returning()
  return zone
}

export const cleanUpDataBase = async () => {
  await db.delete(complianceLogs)
  await db.delete(protocolZones)
  await db.delete(protocols)
  await db.delete(hazardZones)
  await db.delete(users)
}