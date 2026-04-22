import { db } from "../../db/connection.ts"
import { users } from "./user.schema.ts"
import { type InsertUser } from "./user.schema.ts"
import { type RegisterResult, type LoginResult } from "./user.types.ts"
import { hashPassword, comparePassword } from "@shared/utils/auth-utils.ts"
import { eq } from 'drizzle-orm'
import { getDatabaseError } from "@shared/utils/db-error.ts"

export class UserService {
  static async register(data: InsertUser): Promise<RegisterResult> {
    try {
      const hashedPassword = await hashPassword(data.password)

      const [newUser] = await db.insert(users).values({
        ...data, password: hashedPassword
      }).returning({
        id: users.id,
        email: users.email,
        username: users.username,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

      if (!newUser) {
        return { type: 'error', message: 'Failed to register: user not created' }
      }

      return { type: 'success', data: newUser }

    } catch (error) {
      const dbError = getDatabaseError(error)
      
      if (dbError && dbError.code === '23505') {
        const detail = dbError.detail || '';
        
        if (detail.includes('email')) {
          return { type: 'error', message: 'Email já está em uso' }
        }
        if (detail.includes('username')) {
          return { type: 'error', message: 'Username já está em uso' }
        }
        return { type: 'error', message: 'Usuário já existe' }
      }
      
      console.error('Registration error:', error)
      return { type: 'error', message: 'Erro ao registrar usuário' }
    }
  }

  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (!user) {
        return { type: 'error', message: 'Failed to login: user not found' }
      }

      const isPasswordValid = await comparePassword(password, user.password)

      if (!isPasswordValid) {
        return { type: 'error', message: 'Credentials invalid' }
      }

      const { password: _, ...cleanUser } = user

      return { type: 'success', data: cleanUser }
    } catch (error) {
      console.error('Login error:', error)
      return { type: 'error', message: 'Erro ao fazer login' }
    }
  }
}
