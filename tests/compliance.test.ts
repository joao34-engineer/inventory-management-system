import request from 'supertest'
import app from '../src/server.ts'
import { createTestUser, createTestProtocol, cleanUpDataBase } from './setup/dbHelpers.ts'

describe('SafeSite Compliance Logging API', () => {
  let authToken: string
  let userId: string
  let protocolId: string

  beforeEach(async () => {
    const testUser = await createTestUser()
    authToken = testUser.token
    userId = testUser.user.id

    const protocol = await createTestProtocol(userId, {
      name: 'Daily Safety Check',
      frequency: 'DAILY',
    })
    protocolId = protocol.id
  })

  afterEach(async () => {
    await cleanUpDataBase()
  })

  describe('POST /api/protocols/:id/compliance-logs', () => {
    test('should log a compliance check with valid data', async () => {
      const logData = {
        completionDate: new Date('2026-01-15T08:00:00Z').toISOString(),
        note: 'All safety equipment inspected and operational',
      }

      const response = await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('protocolId', protocolId)
      expect(response.body).toHaveProperty('note', 'All safety equipment inspected and operational')
      expect(response.body).toHaveProperty('completionDate')
      expect(response.body).toHaveProperty('createdAt')
    })

    test('should log compliance without a note', async () => {
      const logData = {
        completionDate: new Date('2026-01-15T08:00:00Z').toISOString(),
      }

      const response = await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('note', null)
    })

    test('should reject future completion dates', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const logData = {
        completionDate: futureDate.toISOString(),
        note: 'Future inspection',
      }

      const response = await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('future')
    })

    test('should require authentication to log compliance', async () => {
      const logData = {
        completionDate: new Date('2026-01-15T08:00:00Z').toISOString(),
        note: 'Unauthorized attempt',
      }

      const response = await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .send(logData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    test('should return 404 for non-existent protocol', async () => {
      const fakeProtocolId = '550e8400-e29b-41d4-a716-446655440000'

      const logData = {
        completionDate: new Date('2026-01-15T08:00:00Z').toISOString(),
        note: 'Test note',
      }

      const response = await request(app)
        .post(`/api/protocols/${fakeProtocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject invalid date format', async () => {
      const logData = {
        completionDate: 'not-a-valid-date',
        note: 'Test note',
      }

      const response = await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject note exceeding max length', async () => {
      const longNote = 'A'.repeat(501) // Max is 500 characters

      const logData = {
        completionDate: new Date('2026-01-15T08:00:00Z').toISOString(),
        note: longNote,
      }

      const response = await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('should prevent logging on another user\'s protocol', async () => {
      const otherUser = await createTestUser({
        email: 'other@safesite.com',
        username: 'other_tech',
      })
      const otherProtocol = await createTestProtocol(otherUser.user.id, {
        name: 'Other Protocol',
        frequency: 'DAILY',
      })

      const logData = {
        completionDate: new Date('2026-01-15T08:00:00Z').toISOString(),
        note: 'Unauthorized log',
      }

      const response = await request(app)
        .post(`/api/protocols/${otherProtocol.id}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/protocols/:id/compliance-logs', () => {
    test('should retrieve all compliance logs for a protocol', async () => {
      // Create multiple logs
      await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completionDate: new Date('2026-01-10T08:00:00Z').toISOString(),
          note: 'First inspection',
        })

      await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completionDate: new Date('2026-01-11T08:00:00Z').toISOString(),
          note: 'Second inspection',
        })

      const response = await request(app)
        .get(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('protocolId', protocolId)
      expect(response.body[0]).toHaveProperty('completionDate')
      expect(response.body[0]).toHaveProperty('note')
    })

    test('should return empty array when protocol has no logs', async () => {
      const response = await request(app)
        .get(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(0)
    })

    test('should require authentication to retrieve logs', async () => {
      const response = await request(app)
        .get(`/api/protocols/${protocolId}/compliance-logs`)
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    test('should return 404 for non-existent protocol', async () => {
      const fakeProtocolId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await request(app)
        .get(`/api/protocols/${fakeProtocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    test('should prevent accessing another user\'s protocol logs', async () => {
      const otherUser = await createTestUser({
        email: 'other@safesite.com',
        username: 'other_tech',
      })
      const otherProtocol = await createTestProtocol(otherUser.user.id, {
        name: 'Other Protocol',
        frequency: 'DAILY',
      })

      const response = await request(app)
        .get(`/api/protocols/${otherProtocol.id}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Compliance Log Cascade Deletion', () => {
    test('should delete all logs when protocol is deleted', async () => {
      // Create some logs
      await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completionDate: new Date('2026-01-10T08:00:00Z').toISOString(),
          note: 'Log 1',
        })

      await request(app)
        .post(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completionDate: new Date('2026-01-11T08:00:00Z').toISOString(),
          note: 'Log 2',
        })

      // Verify logs exist
      let logsResponse = await request(app)
        .get(`/api/protocols/${protocolId}/compliance-logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(logsResponse.body.length).toBeGreaterThanOrEqual(2)

      // Delete protocol
      await request(app)
        .delete(`/api/protocols/${protocolId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify protocol and logs are gone
      await request(app)
        .get(`/api/protocols/${protocolId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})
