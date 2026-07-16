import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()

const DEFAULT_CATEGORIES = [
  { nome: 'Stipendio', icona: '💼', tipo: 'entrata' },
  { nome: 'Freelance', icona: '💻', tipo: 'entrata' },
  { nome: 'Vendite', icona: '💰', tipo: 'entrata' },
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
    const { nome, icona, tipo } = req.body
    if (!nome || !icona || !tipo) { res.status(400).json({ error: 'All fields required' }); return }
    const cat = await prisma.category.create({
      data: { userId: req.userId!, nome, icona, tipo }
    })
    res.status(201).json(cat)
  } catch (err) { console.error('CreateCategory error:', err); res.status(500).json({ error: 'Failed' }) }
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
