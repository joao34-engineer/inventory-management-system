import type { Request, Response } from 'express'
import { ProductService } from './products.service.ts'
import { BadRequestError, NotFoundError } from '../../shared/middleware/globalError.ts'
import { type ProductParams } from './products.types.ts'

export class ProductController {

  static async getAllController(req: Request, res: Response) {
    const result = await ProductService.getAllProducts()

    if (result.type === 'error') {
      throw new BadRequestError(result.message)
    }

    return res.status(200).json({
      status: 'success',
      data: result.data
    })
  }

  static async createController(req: Request, res: Response) {
    const result = await ProductService.createProduct(req.body)

    if (result.type === 'error') {
      throw new BadRequestError(result.message)
    }

    return res.status(201).json({
      status: 'success',
      data: result.data
    })
  }

  static async getControllerById(req: Request<ProductParams>, res: Response) {
    const { id } = req.params
    const result = await ProductService.getProductById(id)

    if (result.type === 'error') {
      throw new NotFoundError(result.message)
    }

    return res.status(200).json({
      status: 'success',
      data: result.data
    })
  }

  static async deleteController(req: Request<ProductParams>, res: Response) {
    const { id } = req.params
    const result = await ProductService.deleteProduct(id)

    if (result.type === 'error') {
      throw new NotFoundError(result.message)
    }

    return res.status(200).json({
      status: 'success',
      data: result.data
    })
  }
}
