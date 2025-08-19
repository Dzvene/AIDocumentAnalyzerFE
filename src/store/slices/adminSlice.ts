import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalShops: number
  activeUsers: number
  pendingOrders: number
  completedOrders: number
}

interface AdminState {
  dashboardStats: DashboardStats | null
  loading: boolean
  error: string | null
  notifications: AdminNotification[]
  activityLogs: ActivityLog[]
}

interface AdminNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: string
  read: boolean
}

interface ActivityLog {
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
  ipAddress?: string
}

const initialState: AdminState = {
  dashboardStats: null,
  loading: false,
  error: null,
  notifications: [],
  activityLogs: []
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDashboardStats: (state, action: PayloadAction<DashboardStats>) => {
      state.dashboardStats = action.payload
      state.loading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setNotifications: (state, action: PayloadAction<AdminNotification[]>) => {
      state.notifications = action.payload
    },
    addNotification: (state, action: PayloadAction<AdminNotification>) => {
      state.notifications.unshift(action.payload)
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    setActivityLogs: (state, action: PayloadAction<ActivityLog[]>) => {
      state.activityLogs = action.payload
    },
    addActivityLog: (state, action: PayloadAction<ActivityLog>) => {
      state.activityLogs.unshift(action.payload)
    },
    clearActivityLogs: (state) => {
      state.activityLogs = []
    },
    updateDashboardStat: (state, action: PayloadAction<{ key: keyof DashboardStats; value: number }>) => {
      if (state.dashboardStats) {
        state.dashboardStats[action.payload.key] = action.payload.value
      }
    }
  }
})

export const {
  setDashboardStats,
  setLoading,
  setError,
  setNotifications,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  setActivityLogs,
  addActivityLog,
  clearActivityLogs,
  updateDashboardStat
} = adminSlice.actions

export default adminSlice.reducer