import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken } from '../middleware/auth'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      res.status(400).json({ error: 'Email, name and password required' })
      return
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, name, password: hashed }
    })
    const token = generateToken(user.id)
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency }
    })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' })
      return
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = generateToken(user.id)
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency }
    })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, currency: true, budget: true, autoLock: true, hideBalance: true, roundUp: true }
    })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    res.json(user)
  } catch { res.status(500).json({ error: 'Failed' }) }
})

router.put('/profile', async (req: any, res: Response) => {
  try {
    const { name, currency, budget, autoLock, hideBalance, roundUp } = req.body
    const data: any = {}
    if (name !== undefined) data.name = name
    if (currency !== undefined) data.currency = currency
    if (budget !== undefined) data.budget = budget
    if (autoLock !== undefined) data.autoLock = autoLock
    if (hideBalance !== undefined) data.hideBalance = hideBalance
    if (roundUp !== undefined) data.roundUp = roundUp
    const user = await prisma.user.update({ where: { id: req.userId }, data })
    res.json(user)
  } catch { res.status(500).json({ error: 'Failed to update profile' }) }
})

export default router
