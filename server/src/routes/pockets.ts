import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createSchema = z.object({
  nome: z.string().min(1).max(50),
  colore: z.string().optional().default('purple'),
})

const updateSchema = z.object({
  nome: z.string().min(1).max(50).optional(),
  colore: z.string().optional(),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pockets = await prisma.pocket.findMany({
      where: { userId: req.userId },
      orderBy: { id: 'asc' }
    })
    res.json(pockets)
  } catch (err) { console.error('GetPockets error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body)
    const pocket = await prisma.pocket.create({
      data: { userId: req.userId!, nome: body.nome, colore: body.colore, saldo: 0 }
    })
    res.status(201).json(pocket)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('CreatePocket error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const pocket = await prisma.pocket.findUnique({ where: { id } })
    if (!pocket || pocket.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    const body = updateSchema.parse(req.body)
    const updated = await prisma.pocket.update({
      where: { id },
      data: { ...(body.nome !== undefined && { nome: body.nome }), ...(body.colore !== undefined && { colore: body.colore }) }
    })
    res.json(updated)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('UpdatePocket error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const pocket = await prisma.pocket.findUnique({ where: { id } })
    if (!pocket || pocket.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    await prisma.pocket.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { console.error('DeletePocket error:', err); res.status(500).json({ error: 'Failed' }) }
})

export default router
