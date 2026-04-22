import { type Request, type Response } from 'express'
import { UserService } from './user.service.ts'
import { generateToken } from '@shared/utils/auth-utils.ts'
import { BadRequestError, UnauthorizedError } from '@shared/middleware/globalError.ts'

export class UserController {

  static async registerController(req: Request, res: Response){
    const result = await UserService.register(req.body)

    if (result.type === 'error') {
      throw new BadRequestError(result.message)
    }

    return res.status(201).json({
      status: 'success',
      data: result.data
    })
  }

  static async loginController(req: Request, res: Response ) {
    const { email, password } = req.body
    const result = await UserService.login(email, password)

    if (result.type === 'error') {
      throw new UnauthorizedError(result.message)
    }

    const token = await generateToken({
      id: result.data.id,
      role: result.data.role
    })

    return res.status(200).json({
      status: 'success',
      token,
      data: result.data
    })
  }
}
