import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { id: 'desc' }
    })
    res.json(goals)
  } catch (err) { console.error('GetGoals error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, target, scadenza } = req.body
    if (!nome || !target || !scadenza) { res.status(400).json({ error: 'All fields required' }); return }
    const goal = await prisma.goal.create({
      data: { userId: req.userId!, nome, target, scadenza, attuale: 0 }
    })
    res.status(201).json(goal)
  } catch (err) { console.error('CreateGoal error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const { delta } = req.body
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal || goal.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    const updated = await prisma.goal.update({
      where: { id },
      data: { attuale: (goal.attuale || 0) + delta }
    })
    res.json(updated)
  } catch (err) { console.error('UpdateGoal error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal || goal.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    await prisma.goal.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { console.error('DeleteGoal error:', err); res.status(500).json({ error: 'Failed' }) }
})

export default router
