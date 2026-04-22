import {
  pgTable,
  uuid,
  text,
  timestamp,

} from 'drizzle-orm/pg-core'

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date())
})

export const insertCategorySchema = createInsertSchema(categories).extend({
  name: z.string().min(2, "O nome da categoria deve ter pelo menos 2 caracteres").max(50)
})

export const selectCategorySchema = createSelectSchema(categories)

export type Category = z.infer<typeof selectCategorySchema>
export type InsertCategory = z.infer<typeof insertCategorySchema>

export const getCategoryParamSchema = z.object({
  id: z.uuid()
})