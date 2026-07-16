import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authMiddleware } from './middleware/auth'
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'
import pocketRoutes from './routes/pockets'
import goalRoutes from './routes/goals'
import categoryRoutes from './routes/categories'
import budgetRoutes from './routes/budgets'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'] }))
app.use(express.json({ limit: '10kb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/transactions', authMiddleware, transactionRoutes)
app.use('/api/pockets', authMiddleware, pocketRoutes)
app.use('/api/goals', authMiddleware, goalRoutes)
app.use('/api/categories', authMiddleware, categoryRoutes)
app.use('/api/budgets', authMiddleware, budgetRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Salvify API running on http://localhost:${PORT}`)
})
