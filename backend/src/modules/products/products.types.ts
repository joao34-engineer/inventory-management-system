import { type Product } from "./products.schema.ts"
import { getProductParamSchema } from "./products.schema.ts"
import { z } from "zod"

export interface JoinedProduct extends Product {
  categoryName: string | null
}

export type ProductResult = 
| { type: 'success'; data: JoinedProduct}
| { type: 'error'; message: string}

export type ProductListResult =
| { type: 'success'; data: JoinedProduct[]}
| { type: 'error'; message: string}

export type ProductParams = z.infer<typeof
getProductParamSchema>