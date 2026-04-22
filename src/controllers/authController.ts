import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import {db} from '../db/connection.ts'
import {users, type NewUser, type User} from '../db/schema.ts'
import {generateToken} from '../utils/jwt.ts'
import {hashPassword} from '../utils/passwords.ts'
import { eq } from 'drizzle-orm'
import { comparePassword } from '../utils/passwords.ts'



export const register = async (
  req: Request<any, any, NewUser>, res: Response) => {

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const hashedPassword = await hashPassword(req.body.password)

    const [user] = await db.insert(users).values({
      ...req.body,
      password: hashedPassword,
    }).returning({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
    })
    
    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })
    
    return res.status(201).json({
      message: 'Welcome to SafeSite! Your account is active.',
      user,
      token
    })

    
  } catch(e: any) {
    console.error('Register error:', e?.message || e)
    // Handle duplicate email/username
    if (e.code === '23505' || e.cause?.code === '23505') {
      return res.status(409).json({ error: 'User with this email or username already exists' })
    }
    return res.status(500).json({error: 'Failed to create user account'})
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const {username, password} = req.body
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (!user) {
      return res.status(401).json({error: 'Authentication failed. Please verify your credentials.'})
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Authentication failed. Please verify your credentials.' })
    }

    
    const token = await generateToken ({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return res.status(200).json({
      message: "Access granted. Stay safe out there.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      token
    })

  } catch (e) {
    console.error('Login error', e)
    res.status(500).json({error: 'Failed to authenticate'})
  }
}

// Get all users (exclude passwords)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users)

    return res.status(200).json({
      message: 'Users retrieved successfully',
      users: allUsers,
      count: allUsers.length,
    })
  } catch (e) {
    console.error('Get users error:', e)
    return res.status(500).json({ error: 'Failed to retrieve users' })
  }
}

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        password: false, // Exclude password
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({
      message: 'User retrieved successfully',
      user,
    })
  } catch (e) {
    console.error('Get user by ID error:', e)
    return res.status(500).json({ error: 'Failed to retrieve user' })
  }
}

// Update user profile (email, username, firstName, lastName)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    // Authorization: users can only update their own profile
    if (id !== userId) {
      return res.status(403).json({ error: 'You can only update your own profile' })
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Build update object with only allowed fields
    const updateData: any = {}
    
    if (req.body.email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }
      updateData.email = req.body.email
    }

    if (req.body.username !== undefined) {
      if (req.body.username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' })
      }
      updateData.username = req.body.username
    }

    if (req.body.firstName !== undefined) {
      updateData.firstName = req.body.firstName
    }

    if (req.body.lastName !== undefined) {
      updateData.lastName = req.body.lastName
    }

    // Add updated timestamp
    updateData.updatedAt = new Date()

    // Perform update
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (e: any) {
    console.error('Update user error:', e)
    // Handle duplicate email/username
    if (e.code === '23505' || e.cause?.code === '23505') {
      return res.status(409).json({ error: 'Email or username already in use' })
    }
    return res.status(500).json({ error: 'Failed to update user profile' })
  }
}

// Update user password (requires old password verification)
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id
    const { oldPassword, newPassword } = req.body

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    // Authorization: users can only change their own password
    if (id !== userId) {
      return res.status(403).json({ error: 'You can only change your own password' })
    }

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' })
    }

    // Validate new password strength (minimum 6 characters)
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    // Get current user with password
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify old password
    const isValidPassword = await comparePassword(oldPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))

    return res.status(200).json({
      message: 'Password updated successfully',
    })
  } catch (e) {
    console.error('Update password error:', e)
    return res.status(500).json({ error: 'Failed to update password' })
  }
}

// Delete user account (cascade deletes protocols)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    // Authorization: users can only delete their own account
    if (id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own account' })
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete user (cascade will delete protocols, compliance logs, etc.)
    await db.delete(users).where(eq(users.id, id))

    return res.status(200).json({
      message: 'User account deleted successfully',
    })
  } catch (e) {
    console.error('Delete user error:', e)
    return res.status(500).json({ error: 'Failed to delete user account' })
  }
}
