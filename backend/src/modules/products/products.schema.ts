import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'
import { categories } from '../categories/categories.schema.ts'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const PRODUCTS_STATUSES = ['active', 'inactive', 'discontinued', 'in-stock', 'low-stock', 'out-of-stock'] as const
type ProductStatus = (typeof PRODUCTS_STATUSES)[number]

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sku: text('sku').unique().notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull().default(0),
  status: text('status').$type<ProductStatus>().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  categoryId: uuid('category_id').references(() => categories.id),
  description: text('description').notNull()
})


export const insertProductSchema = createInsertSchema(products).extend({
  // Accept price in cents directly from frontend
  price: z.number().int().positive(),
  quantity: z.number().int().min(0),
  status: z.enum(PRODUCTS_STATUSES),
})

export type InsertProduct = z.infer<typeof insertProductSchema>

export const selectProductSchema = createSelectSchema(products)
export type Product = z.infer<typeof selectProductSchema>

export const getProductParamSchema = z.object({
  id: z.uuid()
})