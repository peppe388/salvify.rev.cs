import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().optional(),
  budget: z.number().min(0).optional(),
  autoLock: z.number().min(0).optional(),
  hideBalance: z.boolean().optional(),
  roundUp: z.boolean().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
})

function sanitizeUser(user: { id: number; email: string; name: string; currency: string; budget: number; autoLock: number; hideBalance: boolean; roundUp: boolean }) {
  return user
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) { res.status(409).json({ error: 'Email already registered' }); return }
    const hashed = await bcrypt.hash(body.password, 10)
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, password: hashed }
    })
    const token = generateToken(user.id)
    res.status(201).json({ token, user: sanitizeUser(user) })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('Register error:', err); res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return }
    const valid = await bcrypt.compare(body.password, user.password)
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return }
    const token = generateToken(user.id)
    res.json({ token, user: sanitizeUser(user) })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('Login error:', err); res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, currency: true, budget: true, autoLock: true, hideBalance: true, roundUp: true }
    })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    res.json(user)
  } catch (err) { console.error('GetMe error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const body = profileSchema.parse(req.body)
    const user = await prisma.user.update({ where: { id: req.userId }, data: body })
    res.json(user)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('UpdateProfile error:', err); res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const body = passwordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    const valid = await bcrypt.compare(body.currentPassword, user.password)
    if (!valid) { res.status(401).json({ error: 'Current password is incorrect' }); return }
    const hashed = await bcrypt.hash(body.newPassword, 10)
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } })
    res.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('ChangePassword error:', err); res.status(500).json({ error: 'Failed to change password' })
  }
})

export default router
