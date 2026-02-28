import api from './axios'
import { type Wallet } from '../types'

export const walletApi = {
  getWallet: async (): Promise<{ wallet: Wallet }> => {
    const wall = await api.get("/api/wallet")
    return wall.data
  },
  addMoney: async (amount: number, note: string) => {
    const wallet = await api.post("/api/wallet/add",{amount,note})
    return wallet
  },
  withdraw: async (amount: number, categoryId: string, note: string) => {
        const wallet = await api.post("/api/wallet/withdraw",{amount,categoryId,note})
        return wallet
  }

}