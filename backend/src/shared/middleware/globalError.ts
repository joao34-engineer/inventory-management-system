import type { Request, Response, NextFunction} from 'express'
import { ZodError } from 'zod'
import { isDev } from '../../env.ts'

export class APIError extends Error {
  constructor(
    public override message: string,
    public status: number = 500,
    public  errors?: unknown[]

  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends APIError {
  constructor(message: string){
    super(message, 400)
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string) {
    super(message, 401)
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(message, 404)
  }
}

export const errorHandler = (
  err: Error | APIError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = 500
  let message = 'Internal Server Error'
  let errors: unknown[] | undefined = undefined

  if (err instanceof ZodError) {
    status = 400
    message = "Validation Failed"
    errors = err.issues.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }))
  }

  else if (err instanceof APIError) {
    status = err.status
    message = err.message
    errors = err.errors
  }

  if (!isDev()){
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.message)
  } else if (!(err instanceof ZodError)) {
    console.error('SERVER ERROR:', err)
  }

  return res.status(status).json({
    status: 'error',
    message,
    ...(errors && { errors}),
    ...(isDev() && { stack: err.stack})
  })
}

