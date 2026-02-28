import api from './axios'
import { type Transaction } from '../types'

export const transactionApi = {
  getTransactions: async (month?: number, year?: number): Promise<{ transaction: Transaction[] }> => {
    // GET /api/transactions
    // hint: pass month/year as query params { params: { month, year } }
    const trans = await api.get("/api/transactions", { params: { month, year } })
    return trans.data
  },
  getSummary: async () => {
    // GET /api/transactions/summary
    const summary = await api.get("/api/transactions/summary")
    return summary.data
  }
}