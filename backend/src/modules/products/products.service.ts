import { db } from "../../db/connection.ts"
import { products } from "./products.schema.ts"
import { categories } from "../categories/categories.schema.ts"
import { type InsertProduct} from "./products.schema.ts"
import { type ProductResult, type ProductListResult, type JoinedProduct } from "./products.types.ts"
import { eq } from "drizzle-orm"
import { isDataBaseError } from "../../shared/utils/db-error.ts"

export class ProductService {

  static async createProduct(data: InsertProduct): Promise<ProductResult> {

    try {
      const [newProduct] = await db
        .insert(products)
        .values(data)
        .returning()

      if (!newProduct) {
        return { type: 'error', message: 'Failed to create product' }
      }

      // Refetch to get JoinedProduct data for frontend consistency
      const result = await this.getProductById(newProduct.id)
      return result
      
    } catch (error) {
        if (isDataBaseError(error) && error.code === '23505' )  {
          
          return { type: 'error', message: `SKU ${data.sku} already exists` }
        }
        throw error
    }
  }

  static async getAllProducts(): Promise<ProductListResult> {
      try {
        const results = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          price: products.price,
          quantity: products.quantity,
          status: products.status,
          description: products.description,
          categoryId: products.categoryId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))

      return { type: 'success', data: results }
      } catch (error) {
        return { type: 'error', message: 'Failed to fetch products' }
      }
  }


  static async getProductById(id: string): Promise<ProductResult> { 
      try {
        const [productById] = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          price: products.price,
          quantity: products.quantity,
          status: products.status,
          description: products.description,
          categoryId: products.categoryId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, id))

      if (!productById) {
        return { type: 'error', message: `Product with ${id} not found` }
      }
      return { type: 'success', data: productById as JoinedProduct }
      } catch (error) {
        return { type: 'error', message: 'Failed to fetch product' }
      }
  }

  static async deleteProduct(id: string): Promise<ProductResult> {
    try {
      const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning()
      
      if (!deleted) {
        return { type: 'error', message: `Product with ${id} not found` }
      }
      
      const result: JoinedProduct = {
        ...deleted,
        categoryName: null
      }
      
      return { type: 'success', data: result }

    } catch(error) {
      return { type: 'error', message: 'Failed to delete product' }
    }
  }
}
