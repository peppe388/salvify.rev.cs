export interface User {
  id: number
  email: string
  name: string
  currency: string
  budget: number
  autoLock: number
  hideBalance: boolean
  roundUp: boolean
}

export interface Transaction {
  id: number
  userId: number
  tipo: 'entrata' | 'uscita'
  importo: number
  categoria: string
  nota: string
  data: string
  pocketId: number | null
  isRoundUp: boolean
  createdAt: string
}

export interface Pocket {
  id: number
  userId: number
  nome: string
  colore: string
  saldo: number
}

export interface Goal {
  id: number
  userId: number
  nome: string
  target: number
  attuale: number
  scadenza: string
  createdAt: string
}

export interface Category {
  id: number
  userId: number
  nome: string
  icona: string
  tipo: 'entrata' | 'uscita'
}

export interface CategoryBudget {
  id: number
  userId: number
  categoria: string
  budget: number
}
