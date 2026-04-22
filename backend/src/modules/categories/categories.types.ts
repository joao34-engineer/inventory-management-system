import { z } from "zod"
import { type Category, getCategoryParamSchema } from "./categories.schema.ts"

export type CategoryResult = 
  | { type: 'success'; data: Category }
  | { type: 'error'; message: string }

export type CategoryListResult =
  | { type: 'success'; data: Category[] }
  | { type: 'error'; message: string }

export type CategoryParams = z.infer<typeof getCategoryParamSchema>
