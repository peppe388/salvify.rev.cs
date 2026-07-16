import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

function getSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return process.env.JWT_SECRET
}

export interface AuthRequest extends Request {
  userId?: number
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, getSecret(), { expiresIn: '7d' })
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, getSecret()) as { userId: number }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
