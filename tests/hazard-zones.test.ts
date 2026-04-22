import request from 'supertest'
import app from '../src/server.ts'
import { createTestUser, createTestProtocol, createTestHazardZone, cleanUpDataBase } from './setup/dbHelpers.ts'

describe('SafeSite Hazard Zone API', () => {
  let authToken: string
  let userId: string

  beforeEach(async () => {
    const testUser = await createTestUser()
    authToken = testUser.token
    userId = testUser.user.id
  })

  afterEach(async () => {
    await cleanUpDataBase()
  })

  describe('POST /api/hazard-zones', () => {
    test('should create a hazard zone with valid data', async () => {
      const zoneData = {
        name: 'High Voltage Area',
        color: '#dc2626',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', 'High Voltage Area')
      expect(response.body).toHaveProperty('color', '#dc2626')
      expect(response.body).toHaveProperty('createdAt')
    })

    test('should create zone with default green color when not specified', async () => {
      const zoneData = {
        name: 'General Workspace',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(201)

      expect(response.body).toHaveProperty('color', '#16a34a')
    })

    test('should reject zone creation without authentication', async () => {
      const zoneData = {
        name: 'Unauthorized Zone',
        color: '#dc2626',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .send(zoneData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject duplicate zone names', async () => {
      const zoneData = {
        name: 'Chemical Storage',
        color: '#eab308',
      }

      await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(201)

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(409)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject invalid hex color format', async () => {
      const zoneData = {
        name: 'Invalid Color Zone',
        color: 'red',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject hex color without hash symbol', async () => {
      const zoneData = {
        name: 'No Hash Zone',
        color: 'dc2626',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject zone name less than 3 characters', async () => {
      const zoneData = {
        name: 'HV',
        color: '#dc2626',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject zone name exceeding 50 characters', async () => {
      const zoneData = {
        name: 'A'.repeat(51),
        color: '#dc2626',
      }

      const response = await request(app)
        .post('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/hazard-zones', () => {
    test('should retrieve all hazard zones', async () => {
      await createTestHazardZone({ name: 'Zone 1', color: '#dc2626' })
      await createTestHazardZone({ name: 'Zone 2', color: '#eab308' })
      await createTestHazardZone({ name: 'Zone 3', color: '#16a34a' })

      const response = await request(app)
        .get('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(3)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('color')
    })

    test('should return empty array when no zones exist', async () => {
      const response = await request(app)
        .get('/api/hazard-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(0)
    })

    test('should require authentication to list zones', async () => {
      const response = await request(app)
        .get('/api/hazard-zones')
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/hazard-zones/:id', () => {
    test('should retrieve a zone with associated protocols', async () => {
      const zone = await createTestHazardZone({ 
        name: 'High Voltage Area', 
        color: '#dc2626' 
      })

      const protocol = await createTestProtocol(userId, {
        name: 'Voltage Detector Check',
        frequency: 'DAILY',
        zoneIds: [zone.id],
      })

      const response = await request(app)
        .get(`/api/hazard-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', zone.id)
      expect(response.body).toHaveProperty('name', 'High Voltage Area')
      expect(response.body).toHaveProperty('color', '#dc2626')
      expect(response.body).toHaveProperty('protocols')
      expect(Array.isArray(response.body.protocols)).toBe(true)
    })

    test('should return 404 for non-existent zone', async () => {
      const fakeZoneId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await request(app)
        .get(`/api/hazard-zones/${fakeZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    test('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/hazard-zones/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/hazard-zones/:id', () => {
    test('should update zone name', async () => {
      const zone = await createTestHazardZone({ 
        name: 'Original Name', 
        color: '#dc2626' 
      })

      const response = await request(app)
        .patch(`/api/hazard-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Zone Name' })
        .expect(200)

      expect(response.body).toHaveProperty('name', 'Updated Zone Name')
      expect(response.body).toHaveProperty('color', '#dc2626')
    })

    test('should update zone color', async () => {
      const zone = await createTestHazardZone({ 
        name: 'Test Zone', 
        color: '#dc2626' 
      })

      const response = await request(app)
        .patch(`/api/hazard-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ color: '#eab308' })
        .expect(200)

      expect(response.body).toHaveProperty('color', '#eab308')
    })

    test('should reject update with duplicate name', async () => {
      await createTestHazardZone({ name: 'Existing Zone', color: '#dc2626' })
      const zone2 = await createTestHazardZone({ name: 'Zone 2', color: '#eab308' })

      const response = await request(app)
        .patch(`/api/hazard-zones/${zone2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Existing Zone' })
        .expect(409)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject update with invalid color', async () => {
      const zone = await createTestHazardZone({ 
        name: 'Test Zone', 
        color: '#dc2626' 
      })

      const response = await request(app)
        .patch(`/api/hazard-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ color: 'not-a-hex-color' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/hazard-zones/:id', () => {
    test('should delete a hazard zone without protocols', async () => {
      const zone = await createTestHazardZone({ 
        name: 'Zone to Delete', 
        color: '#dc2626' 
      })

      const response = await request(app)
        .delete(`/api/hazard-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Hazard zone deleted successfully')

      // Verify zone is deleted
      await request(app)
        .get(`/api/hazard-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    test('should return 404 when deleting non-existent zone', async () => {
      const fakeZoneId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await request(app)
        .delete(`/api/hazard-zones/${fakeZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Zone-Protocol Association', () => {
    test('should create protocol with multiple hazard zones', async () => {
      const zone1 = await createTestHazardZone({ name: 'Zone 1', color: '#dc2626' })
      const zone2 = await createTestHazardZone({ name: 'Zone 2', color: '#eab308' })

      const protocolData = {
        name: 'Multi-Zone Protocol',
        frequency: 'DAILY',
        targetCount: 1,
        zoneIds: [zone1.id, zone2.id],
      }

      const response = await request(app)
        .post('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .send(protocolData)
        .expect(201)

      expect(response.body).toHaveProperty('zones')
      expect(response.body.zones.length).toBe(2)
    })

    test('should update protocol zone associations', async () => {
      const zone1 = await createTestHazardZone({ name: 'Zone 1', color: '#dc2626' })
      const zone2 = await createTestHazardZone({ name: 'Zone 2', color: '#eab308' })

      const protocol = await createTestProtocol(userId, {
        name: 'Test Protocol',
        frequency: 'DAILY',
        zoneIds: [zone1.id],
      })

      const response = await request(app)
        .patch(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ zoneIds: [zone2.id] })
        .expect(200)

      expect(response.body).toHaveProperty('zones')
      expect(response.body.zones.length).toBe(1)
      expect(response.body.zones[0].id).toBe(zone2.id)
    })
  })
})
