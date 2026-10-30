import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  try {
    const payload = verifyToken(authHeader.slice(7))
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }
    next()
  })
}
