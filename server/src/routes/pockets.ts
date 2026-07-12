import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pockets = await prisma.pocket.findMany({
      where: { userId: req.userId },
      orderBy: { id: 'asc' }
    })
    res.json(pockets)
  } catch { res.status(500).json({ error: 'Failed' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, colore } = req.body
    if (!nome) { res.status(400).json({ error: 'Name required' }); return }
    const pocket = await prisma.pocket.create({
      data: { userId: req.userId!, nome, colore: colore || 'purple', saldo: 0 }
    })
    res.status(201).json(pocket)
  } catch { res.status(500).json({ error: 'Failed' }) }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const pocket = await prisma.pocket.findUnique({ where: { id } })
    if (!pocket || pocket.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    await prisma.pocket.delete({ where: { id } })
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Failed' }) }
})

export default router
