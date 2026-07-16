import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createSchema = z.object({
  nome: z.string().min(1).max(50),
  icona: z.string().min(1),
  tipo: z.enum(['entrata', 'uscita']),
})

const updateSchema = z.object({
  nome: z.string().min(1).max(50).optional(),
  icona: z.string().min(1).optional(),
  tipo: z.enum(['entrata', 'uscita']).optional(),
})

const DEFAULT_CATEGORIES = [
  { nome: 'Stipendio', icona: '💰', tipo: 'entrata' },
  { nome: 'Freelance', icona: '💻', tipo: 'entrata' },
  { nome: 'Vendite', icona: '🛒', tipo: 'entrata' },
  { nome: 'Altro entrate', icona: '📥', tipo: 'entrata' },
  { nome: 'Casa', icona: '🏠', tipo: 'uscita' },
  { nome: 'Cibo', icona: '🍕', tipo: 'uscita' },
  { nome: 'Trasporti', icona: '🚗', tipo: 'uscita' },
  { nome: 'Svago', icona: '🎬', tipo: 'uscita' },
  { nome: 'Salute', icona: '💊', tipo: 'uscita' },
  { nome: 'Shopping', icona: '🛍️', tipo: 'uscita' },
  { nome: 'Bollette', icona: '📄', tipo: 'uscita' },
  { nome: 'Abbonamenti', icona: '📺', tipo: 'uscita' },
  { nome: 'Altro uscite', icona: '📤', tipo: 'uscita' }
]

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let cats = await prisma.category.findMany({ where: { userId: req.userId } })
    if (cats.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map(c => ({ ...c, userId: req.userId! }))
      })
      cats = await prisma.category.findMany({ where: { userId: req.userId } })
    }
    res.json(cats)
  } catch (err) { console.error('GetCategories error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body)
    const cat = await prisma.category.create({
      data: { userId: req.userId!, nome: body.nome, icona: body.icona, tipo: body.tipo }
    })
    res.status(201).json(cat)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('CreateCategory error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const cat = await prisma.category.findUnique({ where: { id } })
    if (!cat || cat.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    const body = updateSchema.parse(req.body)
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: body.nome }),
        ...(body.icona !== undefined && { icona: body.icona }),
        ...(body.tipo !== undefined && { tipo: body.tipo }),
      }
    })
    res.json(updated)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    console.error('UpdateCategory error:', err); res.status(500).json({ error: 'Failed' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const cat = await prisma.category.findUnique({ where: { id } })
    if (!cat || cat.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    await prisma.category.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { console.error('DeleteCategory error:', err); res.status(500).json({ error: 'Failed' }) }
})

export default router
