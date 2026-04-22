import type { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export const validate = (schema: z.ZodType, target:
  'body'
  | 'query'
  | 'params' = 'body') =>

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = await schema.parseAsync(req[target])

      req[target] = validateData
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }
      next(error)
    }
  }


