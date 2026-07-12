import { Router, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createSchema = z.object({
  tipo: z.enum(['entrata', 'uscita']),
  importo: z.number().positive(),
  categoria: z.string(),
  nota: z.string().optional().default(''),
  data: z.string(),
  pocketId: z.number().optional().nullable(),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId, isRoundUp: false },
      orderBy: { id: 'desc' }
    })
    res.json(transactions)
  } catch { res.status(500).json({ error: 'Failed' }) }
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
      if (roundUp > 0.01) {
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
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    res.status(500).json({ error: 'Failed to create transaction' })
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
  } catch { res.status(500).json({ error: 'Failed' }) }
})

export default router
