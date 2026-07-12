import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.categoryBudget.findMany({ where: { userId: req.userId } })
    res.json(budgets)
  } catch { res.status(500).json({ error: 'Failed' }) }
})

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { categoria, budget } = req.body
    if (!categoria || budget === undefined) { res.status(400).json({ error: 'categoria and budget required' }); return }
    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_categoria: { userId: req.userId!, categoria } }
    })
    if (existing) {
      const updated = await prisma.categoryBudget.update({
        where: { id: existing.id },
        data: { budget }
      })
      res.json(updated)
    } else {
      const created = await prisma.categoryBudget.create({
        data: { userId: req.userId!, categoria, budget }
      })
      res.status(201).json(created)
    }
  } catch { res.status(500).json({ error: 'Failed' }) }
})

router.delete('/:categoria', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_categoria: { userId: req.userId!, categoria: String(req.params.categoria) } }
    })
    if (existing) await prisma.categoryBudget.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Failed' }) }
})

export default router
