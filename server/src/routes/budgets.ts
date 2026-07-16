import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const setSchema = z.object({
  categoria: z.string().min(1),
  budget: z.number().min(0),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.categoryBudget.findMany({ where: { userId: req.userId } })
    res.json(budgets)
  } catch (err) { console.error('GetBudgets error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = setSchema.parse(req.body)
    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_categoria: { userId: req.userId!, categoria: body.categoria } }
    })
    if (existing) {
      const updated = await prisma.categoryBudget.update({
        where: { id: existing.id },
        data: { budget: body.budget }
      })
      res.json(updated)
    } else {
      const created = await prisma.categoryBudget.create({
        data: { userId: req.userId!, categoria: body.categoria, budget: body.budget }
      })
      res.status(201).json(created)
    }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues.map(i => i.message).join(', ') }); return }
    console.error('SetBudget error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.delete('/:categoria', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_categoria: { userId: req.userId!, categoria: String(req.params.categoria) } }
    })
    if (existing) await prisma.categoryBudget.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch (err) { console.error('DeleteBudget error:', err); res.status(500).json({ error: 'Failed' }) }
})

export default router
