import api from './axios'
import { type Category } from '../types'

export const categoryApi = {
  getCategories: async (): Promise<{ categorys: Category[] }> => {
    const categories = await api.get("/api/categories")
    return categories.data
  },
  createCategory: async (name: string, icon: string) => {
    const newCategory = await api.post("/api/categories",{name,icon})
    return newCategory
  }
}