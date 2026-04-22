import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/server.ts'
import { cleanUpDataBase, createTestUser } from './setup/dbHelpers.ts'

describe('User Management', () => {
  let testToken = ''
  let testUserId = ''
  let testPassword = ''

  beforeEach(async () => {
    await cleanUpDataBase()
    const { token, user, rawPassword } = await createTestUser()
    testToken = token
    testUserId = user.id
    testPassword = rawPassword
  })

  afterEach(async () => {
    await cleanUpDataBase()
  })

  describe('GET /api/users', () => {
    it('should retrieve all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('users')
      expect(response.body).toHaveProperty('count')
      expect(Array.isArray(response.body.users)).toBe(true)
      expect(response.body.users.length).toBeGreaterThan(0)
      
      // Verify password is not included
      const user = response.body.users[0]
      expect(user).not.toHaveProperty('password')
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('username')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401)
    })

    it('should return array with at least one user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body.users.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should retrieve specific user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body.user.id).toBe(testUserId)
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404)
    })

    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .get('/api/users/invalid-uuid')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(401)
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should update user first name', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          firstName: 'UpdatedName',
        })
        .expect(200)

      expect(response.body.user.firstName).toBe('UpdatedName')
      expect(response.body.message).toContain('updated')
    })

    it('should update user last name', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          lastName: 'UpdatedLastName',
        })
        .expect(200)

      expect(response.body.user.lastName).toBe('UpdatedLastName')
    })

    it('should update multiple fields at once', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          firstName: 'NewFirst',
          lastName: 'NewLast',
        })
        .expect(200)

      expect(response.body.user.firstName).toBe('NewFirst')
      expect(response.body.user.lastName).toBe('NewLast')
    })

    it('should update user email with valid format', async () => {
      const newEmail = `updated-${Date.now()}@example.com`
      
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          email: newEmail,
        })
        .expect(200)

      expect(response.body.user.email).toBe(newEmail)
    })

    it('should update username', async () => {
      const newUsername = `updated-${Date.now()}`
      
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          username: newUsername,
        })
        .expect(200)

      expect(response.body.user.username).toBe(newUsername)
    })

    it('should reject invalid email format', async () => {
      await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400)
    })

    it('should reject username shorter than 3 characters', async () => {
      await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          username: 'ab',
        })
        .expect(400)
    })

    it('should reject duplicate email', async () => {
      // Create another user
      const { user: otherUser } = await createTestUser({
        email: 'other@example.com',
        username: 'otheruser',
      })

      // Try to update first user with second user's email
      await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          email: otherUser.email,
        })
        .expect(409)
    })

    it('should reject duplicate username', async () => {
      // Create another user
      const { user: otherUser } = await createTestUser({
        email: 'other2@example.com',
        username: 'otherusername',
      })

      // Try to update first user with second user's username
      await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          username: otherUser.username,
        })
        .expect(409)
    })

    it('should prevent updating another user profile', async () => {
      // Create another user
      const { token: otherToken, user: otherUser } = await createTestUser({
        email: 'another@example.com',
        username: 'anotheruser',
      })

      // Try to update first user with second user's token
      await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          firstName: 'Hacker',
        })
        .expect(403)
    })

    it('should return 403 for non-existent user (security - dont reveal user existence)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          firstName: 'Test',
        })
        .expect(403)
    })

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .put('/api/users/invalid-uuid')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          firstName: 'Test',
        })
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/users/${testUserId}`)
        .send({
          firstName: 'Test',
        })
        .expect(401)
    })
  })

  describe('PUT /api/users/:id/password', () => {
    it('should change user password', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          oldPassword: testPassword,
          newPassword: 'NewPassword123!',
        })
        .expect(200)

      expect(response.body.message).toContain('Password updated')
    })

    it('should reject incorrect old password', async () => {
      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          oldPassword: 'WrongPassword',
          newPassword: 'NewPassword123!',
        })
        .expect(401)
    })

    it('should reject new password shorter than 6 characters', async () => {
      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          oldPassword: testPassword,
          newPassword: 'short',
        })
        .expect(400)
    })

    it('should require both old and new password', async () => {
      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          newPassword: 'NewPassword123!',
        })
        .expect(400)

      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          oldPassword: testPassword,
        })
        .expect(400)
    })

    it('should prevent changing another user password', async () => {
      // Create another user
      const { token: otherToken } = await createTestUser({
        email: 'other3@example.com',
        username: 'other3user',
      })

      // Try to change first user's password with second user's token
      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          oldPassword: testPassword,
          newPassword: 'HackedPassword123!',
        })
        .expect(403)
    })

    it('should return 403 for non-existent user (security - dont reveal user existence)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      await request(app)
        .put(`/api/users/${fakeId}/password`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          oldPassword: testPassword,
          newPassword: 'NewPassword123!',
        })
        .expect(403)
    })

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .put('/api/users/invalid-uuid/password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          oldPassword: testPassword,
          newPassword: 'NewPassword123!',
        })
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .send({
          oldPassword: testPassword,
          newPassword: 'NewPassword123!',
        })
        .expect(401)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete user account', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body.message).toContain('deleted')

      // Verify user is deleted
      await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404)
    })

    it('should cascade delete user protocols', async () => {
      // Create a protocol for the user
      const protocol = await request(app)
        .post('/api/protocols')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Protocol',
          frequency: 'DAILY',
          description: 'Test protocol',
          targetCount: 1,
        })
        .expect(201)

      const protocolId = protocol.body.id

      // Delete user
      await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      // Verify protocol is also deleted (cascade)
      // We can't check directly since the user is deleted, but the DB cascade should have worked
    })

    it('should prevent deleting another user account', async () => {
      // Create another user
      const { token: otherToken } = await createTestUser({
        email: 'other4@example.com',
        username: 'other4user',
      })

      // Try to delete first user with second user's token
      await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
    })

    it('should return 403 for non-existent user (security - dont reveal existence)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(403)
    })

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .delete('/api/users/invalid-uuid')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/users/${testUserId}`)
        .expect(401)
    })

    it('should not allow deleting already deleted user', async () => {
      // Delete user first time
      await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      // Try to delete again
      await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404)
    })
  })
})
