import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth'
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'
import pocketRoutes from './routes/pockets'
import goalRoutes from './routes/goals'
import categoryRoutes from './routes/categories'
import budgetRoutes from './routes/budgets'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

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
