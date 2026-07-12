const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('salvify_token')
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, name: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password }) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data: Record<string, any>) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Transactions
  getTransactions: () => request('/transactions'),
  createTransaction: (data: any) =>
    request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  deleteTransaction: (id: number) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),

  // Pockets
  getPockets: () => request('/pockets'),
  createPocket: (data: any) =>
    request('/pockets', { method: 'POST', body: JSON.stringify(data) }),
  deletePocket: (id: number) =>
    request(`/pockets/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: () => request('/goals'),
  createGoal: (data: any) =>
    request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: number, attuale: number) =>
    request(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ attuale }) }),
  deleteGoal: (id: number) =>
    request(`/goals/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data: any) =>
    request('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Budgets
  getBudgets: () => request('/budgets'),
  setBudget: (categoria: string, budget: number) =>
    request('/budgets', { method: 'PUT', body: JSON.stringify({ categoria, budget }) }),
  deleteBudget: (categoria: string) =>
    request(`/budgets/${encodeURIComponent(categoria)}`, { method: 'DELETE' }),
}
