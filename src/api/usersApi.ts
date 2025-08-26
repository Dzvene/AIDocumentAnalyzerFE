import axios from './config'

export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  search?: string
  role?: string
  page?: number
  limit?: number
}

export const usersApi = {
  getUsers: async (filters?: UserFilters) => {
    const response = await axios.get('/api/users', { params: filters })
    return response.data
  },
  
  getUserById: async (id: string) => {
    const response = await axios.get(`/api/users/${id}`)
    return response.data
  },
  
  createUser: async (userData: Partial<User>) => {
    const response = await axios.post('/api/users', userData)
    return response.data
  },
  
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await axios.put(`/api/users/${id}`, userData)
    return response.data
  },
  
  deleteUser: async (id: string) => {
    const response = await axios.delete(`/api/users/${id}`)
    return response.data
  }
}