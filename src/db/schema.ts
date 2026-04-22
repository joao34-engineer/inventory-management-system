import {
  pgTable,
  serial,
  varchar,
  uuid,
  text,
  timestamp,
  boolean,
  integer
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

/**
 * Users table - Stores safety personnel credentials and profile information
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Protocols table - Stores recurring safety inspection protocols
 * Examples: "Morning PPE Check", "Lockout/Tagout Verification"
 */
export const protocols = pgTable('protocols', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  /** Protocol name (e.g., "Morning PPE Inspection", "Voltage Detector Test") */
  name: varchar('name', { length: 200 }).notNull(),
  /** Detailed description of the safety protocol */
  description: text('description'),
  /** Frequency: DAILY, WEEKLY, MONTHLY, SHIFT_START, SHIFT_END */
  frequency: varchar('frequency', { length: 20 }).notNull(),
  /** Number of required compliance checks per period */
  targetCount: integer('target_count').default(1),
  /** Whether this protocol is currently enforced */
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Compliance Logs table - Records of completed safety inspections
 * Proof that a safety check was performed by a technician
 */
export const complianceLogs = pgTable('compliance_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  protocolId: uuid('protocol_id')
    .references(() => protocols.id, { onDelete: 'cascade' })
    .notNull(),
  /** Timestamp when the safety inspection was completed */
  completionDate: timestamp('completion_date').defaultNow().notNull(),
  /** Technician observations (e.g., "Gloves showed wear, replaced") */
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * Hazard Zones table - Categorization of protocols by risk level or location
 * Examples: "High Voltage Area" (Red), "Chemical Storage" (Yellow), "General Workspace" (Green)
 */
export const hazardZones = pgTable('hazard_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Zone name (e.g., "High Voltage Area", "Chemical Storage", "Confined Spaces") */
  name: varchar('name', { length: 50 }).notNull().unique(),
  /** Color hex code for risk level indicator - Red (#dc2626): High Risk, Yellow (#eab308): Medium Risk, Green (#16a34a): Low Risk */
  color: varchar('color', { length: 7 }).default('#16a34a'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Protocol Zones table - Many-to-many relationship between protocols and hazard zones
 */
export const protocolZones = pgTable('protocol_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  protocolId: uuid('protocol_id').references(() => protocols.id, { onDelete: 'cascade' }).notNull(),
  zoneId: uuid('zone_id').references(() => hazardZones.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userRelations = relations(users, ({ many }) => ({
  protocols: many(protocols),
}))

export const protocolsRelations = relations(protocols, ({ one, many }) => ({
  user: one(users, {
    fields: [protocols.userId],
    references: [users.id],
  }),
  complianceLogs: many(complianceLogs),
  protocolZones: many(protocolZones),
}))

export const complianceLogsRelations = relations(complianceLogs, ({ one }) => ({
  protocol: one(protocols, {
    fields: [complianceLogs.protocolId],
    references: [protocols.id],
  }),
}))

export const hazardZonesRelations = relations(hazardZones, ({ many }) => ({
  protocolZones: many(protocolZones),
}))

export const protocolZonesRelations = relations(protocolZones, ({ one }) => ({
  protocol: one(protocols, {
    fields: [protocolZones.protocolId],
    references: [protocols.id],
  }),
  hazardZone: one(hazardZones, {
    fields: [protocolZones.zoneId],
    references: [hazardZones.id],
  }),
}))


// Type exports for SafeSite domain model
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Protocol = typeof protocols.$inferSelect
export type NewProtocol = typeof protocols.$inferInsert
export type ComplianceLog = typeof complianceLogs.$inferSelect
export type NewComplianceLog = typeof complianceLogs.$inferInsert
export type HazardZone = typeof hazardZones.$inferSelect
export type NewHazardZone = typeof hazardZones.$inferInsert
export type ProtocolZone = typeof protocolZones.$inferSelect
export type NewProtocolZone = typeof protocolZones.$inferInsert

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const insertProtocolSchema = createInsertSchema(protocols)
export const selectProtocolSchema = createSelectSchema(protocols)
export const insertComplianceLogSchema = createInsertSchema(complianceLogs)
export const selectComplianceLogSchema = createSelectSchema(complianceLogs)
export const insertHazardZoneSchema = createInsertSchema(hazardZones)
export const selectHazardZoneSchema = createSelectSchema(hazardZones)
