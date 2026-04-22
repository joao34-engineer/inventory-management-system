import type { Request, Response } from 'express'
import { CategoryService } from '@modules/categories/categories.service.ts'
import { type CategoryParams } from '@modules/categories/categories.types.ts'

import { BadRequestError, NotFoundError } from '@shared/middleware/globalError.ts'

export class CategoryController {
  /**
   * Controller to get all categories.
   */
  static async getAllController(req: Request, res: Response) {
    const result = await CategoryService.getAllCategories()

    if (result.type === 'error') {
      throw new BadRequestError(result.message)
    }

    return res.status(200).json({
      status: 'success',
      data: result.data
    })
  }

  /**
   * Controller to create a new category.
   */
  static async createController(req: Request, res: Response) {
    const result = await CategoryService.createCategory(req.body)

    if (result.type === 'error') {
      throw new BadRequestError(result.message)
    }

    return res.status(201).json({
      status: 'success',
      data: result.data
    })
  }

  /**
   * Controller to get a specific category by ID.
   */
  static async getControllerById(req: Request<CategoryParams>, res: Response) {
    const { id } = req.params
    const result = await CategoryService.getCategoryById(id)

    if (result.type === 'error') {
      throw new NotFoundError(result.message)
    }

    return res.status(200).json({
      status: 'success',
      data: result.data
    })
  }
}
