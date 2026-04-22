import { JwtPayload } from './authTypes.ts'

 declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}