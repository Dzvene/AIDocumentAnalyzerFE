import axios from './config'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export const notificationsApi = {
  getNotifications: async () => {
    const response = await axios.get('/api/notifications')
    return response.data
  },
  
  getUnreadCount: async () => {
    const response = await axios.get('/api/notifications/unread-count')
    return response.data
  },
  
  markAsRead: async (id: string) => {
    const response = await axios.put(`/api/notifications/${id}/read`)
    return response.data
  },
  
  markAllAsRead: async () => {
    const response = await axios.put('/api/notifications/read-all')
    return response.data
  },
  
  deleteNotification: async (id: string) => {
    const response = await axios.delete(`/api/notifications/${id}`)
    return response.data
  }
}