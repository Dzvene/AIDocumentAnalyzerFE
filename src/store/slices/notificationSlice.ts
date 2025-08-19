import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

interface NotificationState {
  notifications: Notification[]
}

const initialState: NotificationState = {
  notifications: []
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        duration: 5000, // 5 seconds default
        ...action.payload
      }
      state.notifications.push(notification)
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },

    clearAllNotifications: (state) => {
      state.notifications = []
    }
  }
})

export const { 
  addNotification, 
  removeNotification, 
  clearAllNotifications 
} = notificationSlice.actions

export default notificationSlice.reducer

// Action creators for common notifications
export const showSuccessNotification = (title: string, message?: string) => 
  addNotification({ title, message, type: 'success' })

export const showErrorNotification = (title: string, message?: string) => 
  addNotification({ title, message, type: 'error', duration: 7000 })

export const showWarningNotification = (title: string, message?: string) => 
  addNotification({ title, message, type: 'warning' })

export const showInfoNotification = (title: string, message?: string) => 
  addNotification({ title, message, type: 'info' })