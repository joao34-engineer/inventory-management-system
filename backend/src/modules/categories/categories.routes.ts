import { Router } from 'express'
import { CategoryController } from '@modules/categories/categories.controller.ts'
import { validate } from '@shared/middleware/validation.ts'
import { insertCategorySchema, getCategoryParamSchema } from '@modules/categories/categories.schema.ts'
import { authenticateToken } from '@shared/middleware/auth.ts'

export const categoryRouter = Router()

/**
 * Public: Get all categories
 */
categoryRouter.get(
  '/',
  CategoryController.getAllController
)

/**
 * Public: Get category by ID
 */
categoryRouter.get(
  '/:id',
  validate(getCategoryParamSchema, 'params'),
  CategoryController.getControllerById
)

/**
 * Admin: Create a new category
 * Requires authentication
 */
categoryRouter.post(
  '/',
  authenticateToken,
  validate(insertCategorySchema),
  CategoryController.createController
)
