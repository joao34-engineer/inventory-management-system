import request from 'supertest'
import app from '../src/server.ts'
import env from '../env.ts'
import { createTestUser, cleanUpDataBase } from './setup/dbHelpers.ts'


describe('SafeSite Authentication API', () => {
  afterEach(async () => {
    await cleanUpDataBase()
  })

  describe('POST /api/auth/register', () => {
    test('should register a new safety officer with valid credentials', async () => {
      const userData = {
        email: 'officer@safesite.com',
        username: 'safety_officer',
        password: 'SafetyFirst123!',
        firstName: 'Sarah',
        lastName: 'Martinez'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('message', 'Welcome to SafeSite! Your account is active.')
      expect(response.body.user).toHaveProperty('email', 'officer@safesite.com')
      expect(response.body.user).toHaveProperty('username', 'safety_officer')
      expect(response.body.user).toHaveProperty('firstName', 'Sarah')
      expect(response.body.user).toHaveProperty('lastName', 'Martinez')
      expect(response.body.user).not.toHaveProperty('password')
    })

    test('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'duplicate@safesite.com',
        username: 'user1',
        password: 'SafetyFirst123!',
      }

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, username: 'user2' })
        .expect(409)

      expect(response.body).toHaveProperty('error')
    })

    test('should reject registration with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'SafetyFirst123!',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/login', () => {
    test('should authenticate user with valid credentials', async () => {
      const testUser = await createTestUser()

      const credentials = { 
        username: testUser.user.username,
        password: testUser.rawPassword,
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)
      
      expect(response.body).toHaveProperty('message', 'Access granted. Stay safe out there.')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).toHaveProperty('email', testUser.user.email)
      expect(response.body.user).not.toHaveProperty('password')
    })

    test('should reject login with invalid password', async () => {
      const testUser = await createTestUser()

      const credentials = { 
        username: testUser.user.username,
        password: 'WrongPassword123',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)

      expect(response.body).toHaveProperty('error', 'Authentication failed. Please verify your credentials.')
    })

    test('should reject login with non-existent username', async () => {
      const credentials = { 
        username: 'nonexistent_user',
        password: 'SafetyFirst123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)

      expect(response.body).toHaveProperty('error', 'Authentication failed. Please verify your credentials.')
    })
  })
})