import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/auth-utils.ts'



export const authenticateToken = async (req: Request, res: Response, next: 
  NextFunction) => {
    try {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Authentication required'})
      }

      const payload = await verifyToken(token)

      req.user = payload
      next()

    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token'})
    }   
  }   