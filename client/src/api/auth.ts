import api from './axios'
// import { User } from '../types'

// Define the response types based on your backend
interface AuthResponse {
  message: string
  accessToken: string
  id: string
  name: string
  email: string
}

interface RefreshResponse {
  accessToken: string
}

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post("/api/auth/register",{name,email,password})
    // Return the response data
    return data 
  },
  
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Call POST /api/auth/login

    // Return the response data
    const { data } = await api.post("/api/auth/login",{email,password})
    return data
  },
  
  refresh: async (): Promise<RefreshResponse> => {
    // Call POST /api/auth/refresh
    // Return the response data\
    const { data } = await api.post("/api/auth/refresh")
    return data
    
  },
  
  logout: async (): Promise<void> => {
    // Call POST /api/auth/logout
    // No return data needed
    await api.post("/api/auth/logout")
  }
}