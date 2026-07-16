import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createSchema = z.object({
  tipo: z.enum(['entrata', 'uscita']),
  importo: z.number().positive(),
  categoria: z.string().min(1),
  nota: z.string().optional().default(''),
  data: z.string(),
  pocketId: z.number().optional().nullable(),
})

const updateSchema = z.object({
  tipo: z.enum(['entrata', 'uscita']).optional(),
  importo: z.number().positive().optional(),
  categoria: z.string().min(1).optional(),
  nota: z.string().optional(),
  data: z.string().optional(),
  pocketId: z.number().optional().nullable(),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit)) || 50))
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.userId },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId: req.userId } }),
    ])
    res.json({ data: transactions, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) { console.error('GetTransactions error:', err); res.status(500).json({ error: 'Failed' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body)
    const t = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        tipo: body.tipo,
        importo: body.importo,
        categoria: body.categoria,
        nota: body.nota || (body.tipo === 'uscita' ? 'Uscita' : 'Entrata'),
        data: body.data,
        pocketId: body.pocketId || null,
      }
    })

    if (body.pocketId) {
      const pocket = await prisma.pocket.findUnique({ where: { id: body.pocketId } })
      if (pocket && pocket.userId === req.userId) {
        await prisma.pocket.update({
          where: { id: body.pocketId },
          data: { saldo: body.tipo === 'entrata' ? pocket.saldo + body.importo : pocket.saldo - body.importo }
        })
      }
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (user?.roundUp && body.tipo === 'uscita') {
      const roundUp = Math.ceil(body.importo) - body.importo
      if (roundUp >= 0.01) {
        const risparmio = await prisma.pocket.findFirst({
          where: { userId: req.userId, nome: 'Risparmio' }
        })
        if (risparmio) {
          await prisma.transaction.create({
            data: {
              userId: req.userId!,
              tipo: 'entrata', importo: roundUp,
              categoria: 'Altro entrate', nota: 'Round-up risparmio',
              data: body.data, pocketId: risparmio.id, isRoundUp: true
            }
          })
          await prisma.pocket.update({
            where: { id: risparmio.id },
            data: { saldo: risparmio.saldo + roundUp }
          })
        }
      }
    }

    res.status(201).json(t)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues.map(i => i.message).join(', ') }); return }
    console.error('CreateTransaction error:', err)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }

    const body = updateSchema.parse(req.body)
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(body.tipo !== undefined && { tipo: body.tipo }),
        ...(body.importo !== undefined && { importo: body.importo }),
        ...(body.categoria !== undefined && { categoria: body.categoria }),
        ...(body.nota !== undefined && { nota: body.nota }),
        ...(body.data !== undefined && { data: body.data }),
        ...(body.pocketId !== undefined && { pocketId: body.pocketId }),
      }
    })
    res.json(updated)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues.map(i => i.message).join(', ') }); return }
    console.error('UpdateTransaction error:', err)
    res.status(500).json({ error: 'Failed' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const t = await prisma.transaction.findUnique({ where: { id } })
    if (!t || t.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
    if (t.pocketId && !t.isRoundUp) {
      const pocket = await prisma.pocket.findUnique({ where: { id: t.pocketId } })
      if (pocket) {
        await prisma.pocket.update({
          where: { id: t.pocketId },
          data: { saldo: t.tipo === 'uscita' ? pocket.saldo + t.importo : pocket.saldo - t.importo }
        })
      }
    }
    await prisma.transaction.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { console.error('DeleteTransaction error:', err); res.status(500).json({ error: 'Failed' }) }
})

export default router
