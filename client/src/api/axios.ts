import axios from 'axios'
import { tokenStore } from './tokenStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // CRITICAL: sends cookies with requests
})

// Request interceptor - we'll add token logic here later
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if(token){
    config.headers.Authorization="Bearer "+token
  }
  return config
})

// Response interceptor - we'll add refresh logic here later
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 1. Call /api/auth/refresh using plain axios
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const {data} = await axios.post(`${baseURL}/api/auth/refresh`,{},{withCredentials:true})
      // 2. Save new token with tokenStore.set()
      tokenStore.set(data.accessToken)

      // 3. Update originalRequest.headers.Authorization
      originalRequest.headers.Authorization="Bearer "+data.accessToken
      // 4. Return api(originalRequest) to retry
      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api