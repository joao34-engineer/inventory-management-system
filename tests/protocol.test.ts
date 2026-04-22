import request from 'supertest'
import app from '../src/server.ts'
import { createTestUser, createTestProtocol, cleanUpDataBase } from './setup/dbHelpers.ts'

describe('SafeSite Protocol API', () => {
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

  describe('POST /api/protocols', () => {
    test('should create a new safety protocol with valid data', async () => {
      const protocolData = {
        name: 'Morning PPE Inspection',
        description: 'Verify all personal protective equipment before shift',
        frequency: 'DAILY',
        targetCount: 1,
      }

      const response = await request(app)
        .post('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .send(protocolData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', 'Morning PPE Inspection')
      expect(response.body).toHaveProperty('frequency', 'DAILY')
      expect(response.body).toHaveProperty('targetCount', 1)
      expect(response.body).toHaveProperty('isActive', true)
      expect(response.body).toHaveProperty('userId', userId)
    })

    test('should reject protocol creation without authentication', async () => {
      const protocolData = {
        name: 'Fire Extinguisher Check',
        frequency: 'WEEKLY',
        targetCount: 1,
      }

      const response = await request(app)
        .post('/api/protocols')
        .send(protocolData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject protocol with invalid frequency', async () => {
      const protocolData = {
        name: 'Test Protocol',
        frequency: 'INVALID_FREQUENCY',
        targetCount: 1,
      }

      const response = await request(app)
        .post('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .send(protocolData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject protocol with name less than 3 characters', async () => {
      const protocolData = {
        name: 'PP',
        frequency: 'DAILY',
        targetCount: 1,
      }

      const response = await request(app)
        .post('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .send(protocolData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject protocol with targetCount less than 1', async () => {
      const protocolData = {
        name: 'Test Protocol',
        frequency: 'DAILY',
        targetCount: 0,
      }

      const response = await request(app)
        .post('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .send(protocolData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/protocols', () => {
    test('should retrieve all protocols for authenticated user', async () => {
      await createTestProtocol(userId, {
        name: 'Protocol 1',
        frequency: 'DAILY',
      })
      await createTestProtocol(userId, {
        name: 'Protocol 2',
        frequency: 'WEEKLY',
      })

      const response = await request(app)
        .get('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('frequency')
      expect(response.body[0]).toHaveProperty('zones')
    })

    test('should return empty array when user has no protocols', async () => {
      const response = await request(app)
        .get('/api/protocols')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(0)
    })

    test('should require authentication to list protocols', async () => {
      const response = await request(app)
        .get('/api/protocols')
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/protocols/:id', () => {
    test('should retrieve a specific protocol by ID', async () => {
      const protocol = await createTestProtocol(userId, {
        name: 'Fire Extinguisher Check',
        frequency: 'MONTHLY',
      })

      const response = await request(app)
        .get(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', protocol.id)
      expect(response.body).toHaveProperty('name', 'Fire Extinguisher Check')
      expect(response.body).toHaveProperty('frequency', 'MONTHLY')
      expect(response.body).toHaveProperty('complianceLogs')
      expect(response.body).toHaveProperty('zones')
    })

    test('should return 404 for non-existent protocol', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await request(app)
        .get(`/api/protocols/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    test('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/protocols/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/protocols/:id', () => {
    test('should update protocol name and frequency', async () => {
      const protocol = await createTestProtocol(userId, {
        name: 'Original Name',
        frequency: 'DAILY',
      })

      const updateData = {
        name: 'Updated Protocol Name',
        frequency: 'WEEKLY',
      }

      const response = await request(app)
        .patch(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('name', 'Updated Protocol Name')
      expect(response.body).toHaveProperty('frequency', 'WEEKLY')
    })

    test('should update protocol active status', async () => {
      const protocol = await createTestProtocol(userId, {
        name: 'Test Protocol',
        frequency: 'DAILY',
      })

      const response = await request(app)
        .patch(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false })
        .expect(200)

      expect(response.body).toHaveProperty('isActive', false)
    })

    test('should prevent updating another user\'s protocol', async () => {
      const otherUser = await createTestUser({
        email: 'other@safesite.com',
        username: 'other_user',
      })
      const protocol = await createTestProtocol(otherUser.user.id, {
        name: 'Other User Protocol',
        frequency: 'DAILY',
      })

      const response = await request(app)
        .patch(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked Name' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/protocols/:id', () => {
    test('should delete a protocol and cascade compliance logs', async () => {
      const protocol = await createTestProtocol(userId, {
        name: 'Protocol to Delete',
        frequency: 'DAILY',
      })

      const response = await request(app)
        .delete(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Protocol deleted successfully')

      // Verify protocol is actually deleted
      await request(app)
        .get(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    test('should prevent deleting another user\'s protocol', async () => {
      const otherUser = await createTestUser({
        email: 'other@safesite.com',
        username: 'other_user',
      })
      const protocol = await createTestProtocol(otherUser.user.id, {
        name: 'Other User Protocol',
        frequency: 'DAILY',
      })

      const response = await request(app)
        .delete(`/api/protocols/${protocol.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    test('should return 404 when deleting non-existent protocol', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await request(app)
        .delete(`/api/protocols/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })
})
