import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createSchema = z.object({
  nome: z.string().min(1).max(100),
  target: z.number().positive(),
  scadenza: z.string(),
})

const updateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  target: z.number().positive().optional(),
  scadenza: z.string().optional(),
  attuale: z.number().min(0).optional(),
})

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
    const body = createSchema.parse(req.body)
    const goal = await prisma.goal.create({
      data: { userId: req.userId!, nome: body.nome, target: body.target, scadenza: body.scadenza, attuale: 0 }
    })
    res.status(201).json(goal)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues.map(i => i.message).join(', ') }); return }
    console.error('CreateGoal error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal || goal.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    const body = updateSchema.parse(req.body)
    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: body.nome }),
        ...(body.target !== undefined && { target: body.target }),
        ...(body.scadenza !== undefined && { scadenza: body.scadenza }),
        ...(body.attuale !== undefined && { attuale: body.attuale }),
      }
    })
    res.json(updated)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues.map(i => i.message).join(', ') }); return }
    console.error('UpdateGoal error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const { delta } = req.body
    if (typeof delta !== 'number' || delta <= 0) { res.status(400).json({ error: 'Delta must be a positive number' }); return }
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
