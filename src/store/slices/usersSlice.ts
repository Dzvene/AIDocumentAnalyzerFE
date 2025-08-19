import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types/interfaces/user'

interface UsersState {
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
  filters: {
    role: string | null
    status: string | null
    searchQuery: string
  }
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  filters: {
    role: null,
    status: null,
    searchQuery: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalItems: 0
  }
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<UsersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action: PayloadAction<Partial<UsersState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload)
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(u => u.id !== action.payload)
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; status: string }>) => {
      const user = state.users.find(u => u.id === action.payload.userId)
      if (user) {
        user.status = action.payload.status
      }
    },
    updateUserRole: (state, action: PayloadAction<{ userId: string; role: string }>) => {
      const user = state.users.find(u => u.id === action.payload.userId)
      if (user) {
        user.role = action.payload.role
      }
    }
  }
})

export const {
  setUsers,
  setSelectedUser,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  addUser,
  updateUser,
  removeUser,
  updateUserStatus,
  updateUserRole
} = usersSlice.actions

export default usersSlice.reducer