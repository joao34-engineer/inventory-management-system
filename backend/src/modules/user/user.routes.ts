import { Router } from 'express'
import { UserController } from './user.controller.ts'
import { validate } from '@shared/middleware/validation.ts'
import { insertUserSchema, loginSchema } from './user.schema.ts'

export const userRouter = Router()

userRouter.post(
  '/register',
  validate(insertUserSchema),
  UserController.registerController
)

userRouter.post(
  '/login',
  validate(loginSchema),
  UserController.loginController
)