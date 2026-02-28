import api from './axios'
import { type BudgetStatus } from '../types'

export const budgetApi = {
  getBudgetStatus: async (): Promise<{ calculateted: BudgetStatus[] }> => {
    const status = await api.get("/api/budgets/status")
    return status.data 
  },
  setBudget: async (categoryId: string, limitAmount: number, month: number, year: number) => {
    // POST /api/budgets
    const budgets = await api.post("/api/budgets",{categoryId,limitAmount,month,year})
    return budgets
  }
}