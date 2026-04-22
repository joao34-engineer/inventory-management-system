import {
  pgTable,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const USER_ROLE = ['admin', 'staff', 'viewer'] as const
export type UserRole = (typeof USER_ROLE)[number]

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  role: text('role').$type<UserRole>().default('staff').notNull()
})

export const insertUserSchema = createInsertSchema(users).extend({
  email: z.email(),
  role: z.enum(USER_ROLE).optional(),
})

export type InsertUser = z.infer<typeof insertUserSchema>

export const selectUserSchema = createSelectSchema(users).extend({
  role: z.enum(USER_ROLE)
})
export type SelectUser = z.infer<typeof selectUserSchema>

export type CleanUser = Omit<SelectUser, 'password'>

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export type LoginInput = z.infer<typeof loginSchema>