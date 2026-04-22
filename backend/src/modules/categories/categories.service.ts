import { db } from "../../db/connection.ts"
import { categories } from "./categories.schema.ts"
import { type InsertCategory, type Category } from "./categories.schema.ts"
import { eq } from "drizzle-orm"
import { isDataBaseError } from "@shared/utils/db-error.ts"

import { type CategoryResult, type CategoryListResult } from "./categories.types.ts"

export class CategoryService {
  /**
   * Fetches all categories from the database.
   * Zero-any: returns strict Category array.
   */
  static async getAllCategories(): Promise<CategoryListResult> {
    try {
      const data = await db.select().from(categories)
      return { type: 'success', data }
    } catch (error) {
      return { type: 'error', message: 'Falha ao buscar categorias' }
    }
  }

  /**
   * Creates a new category.
   * Zero-any: strict input and output typing.
   */
  static async createCategory(data: InsertCategory): Promise<CategoryResult> {
    try {
      const [newCategory] = await db
        .insert(categories)
        .values(data)
        .returning()

      if (!newCategory) {
        return { type: 'error', message: 'Falha ao criar categoria' }
      }

      return { type: 'success', data: newCategory }
    } catch (error) {
      if (isDataBaseError(error) && error.code === '23505') {
        return { type: 'error', message: `A categoria "${data.name}" já existe` }
      }
      console.error('Error creating category:', error)
      return { type: 'error', message: 'Erro ao criar categoria' }
    }
  }

  /**
   * Fetches a single category by its ID.
   */
  static async getCategoryById(id: string): Promise<CategoryResult> {
    try {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))

      if (!category) {
        return { type: 'error', message: `Categoria com ID ${id} não encontrada` }
      }
      return { type: 'success', data: category }
    } catch (error) {
      return { type: 'error', message: 'Erro ao buscar categoria' }
    }
  }
}
