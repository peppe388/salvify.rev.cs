const API = process.env.NEXT_PUBLIC_API_URL || '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('salvify_token')
}

interface ApiError {
  error: string
  errors?: unknown[]
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(`${API}${path}`, { ...options, headers, signal: controller.signal })
    if (!res.ok) {
      const err: ApiError = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    return res.json()
  } catch (err: unknown) {
    if (err instanceof Error) throw err
    throw new Error('Unknown error')
  } finally {
    clearTimeout(timeout)
  }
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
    currency: string
    budget: number
    autoLock: number
    hideBalance: boolean
    roundUp: boolean
  }
}

interface TransactionInput {
  tipo: string
  importo: number
  categoria: string
  nota: string
  data: string
  pocketId: number | null
}

interface PocketInput {
  nome: string
  colore: string
}

interface GoalInput {
  nome: string
  target: number
  scadenza: string
}

interface CategoryInput {
  nome: string
  icona: string
  tipo: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export async function getAllTransactions(): Promise<import('./types').Transaction[]> {
  const first = await api.getTransactions(1, 100)
  if (first.pages <= 1) return first.data
  const pages: import('./types').Transaction[] = [...first.data]
  for (let p = 2; p <= first.pages; p++) {
    const next = await api.getTransactions(p, 100)
    pages.push(...next.data)
  }
  return pages
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, name: string, password: string) =>
    request<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password }) }),
  getMe: () => request<import('./types').User>('/auth/me'),
  updateProfile: (data: Partial<import('./types').User>) =>
    request<import('./types').User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Transactions
  getTransactions: (page = 1, limit = 50) =>
    request<PaginatedResponse<import('./types').Transaction>>(`/transactions?page=${page}&limit=${limit}`),
  createTransaction: (data: TransactionInput) =>
    request<import('./types').Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: number, data: Partial<TransactionInput>) =>
    request<import('./types').Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: number) =>
    request<{ success: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),

  // Pockets
  getPockets: () => request<import('./types').Pocket[]>('/pockets'),
  createPocket: (data: PocketInput) =>
    request<import('./types').Pocket>('/pockets', { method: 'POST', body: JSON.stringify(data) }),
  updatePocket: (id: number, data: Partial<PocketInput>) =>
    request<import('./types').Pocket>(`/pockets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePocket: (id: number) =>
    request<{ success: boolean }>(`/pockets/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: () => request<import('./types').Goal[]>('/goals'),
  createGoal: (data: GoalInput) =>
    request<import('./types').Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: number, data: Partial<GoalInput & { attuale: number }>) =>
    request<import('./types').Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addToGoal: (id: number, delta: number) =>
    request<import('./types').Goal>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ delta }) }),
  deleteGoal: (id: number) =>
    request<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<import('./types').Category[]>('/categories'),
  createCategory: (data: CategoryInput) =>
    request<import('./types').Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<CategoryInput>) =>
    request<import('./types').Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Budgets
  getBudgets: () => request<import('./types').CategoryBudget[]>('/budgets'),
  setBudget: (categoria: string, budget: number) =>
    request<{ success: boolean }>('/budgets', { method: 'PUT', body: JSON.stringify({ categoria, budget }) }),
  deleteBudget: (categoria: string) =>
    request<{ success: boolean }>(`/budgets/${encodeURIComponent(categoria)}`, { method: 'DELETE' }),
}
