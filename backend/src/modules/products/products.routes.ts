import { Router } from 'express'
import { ProductController } from './products.controller.ts'
import { validate } from '../../shared/middleware/validation.ts'
import { insertProductSchema, getProductParamSchema } from './products.schema.ts'
import { authenticateToken } from '../../shared/middleware/auth.ts'

export const productRouter = Router()

productRouter.get(
  '/', 
  ProductController.getAllController
)

productRouter.get(
  '/:id',
  validate(getProductParamSchema, 'params'),
  ProductController.getControllerById
)

productRouter.post(
  '/',
  authenticateToken,
  validate(insertProductSchema),
  ProductController.createController
)

productRouter.delete(
  '/:id',
  authenticateToken,
  validate(getProductParamSchema, 'params'),
  ProductController.deleteController
)
