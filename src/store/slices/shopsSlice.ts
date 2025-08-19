import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Shop } from '../../types/interfaces/shop'

interface ShopsState {
  shops: Shop[]
  selectedShop: Shop | null
  loading: boolean
  error: string | null
  filters: {
    searchQuery: string
    location: string | null
    category: string | null
  }
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
}

const initialState: ShopsState = {
  shops: [],
  selectedShop: null,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    location: null,
    category: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
    totalItems: 0
  }
}

const shopsSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    setShops: (state, action: PayloadAction<Shop[]>) => {
      state.shops = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedShop: (state, action: PayloadAction<Shop | null>) => {
      state.selectedShop = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<ShopsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action: PayloadAction<Partial<ShopsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addShop: (state, action: PayloadAction<Shop>) => {
      state.shops.push(action.payload)
    },
    updateShop: (state, action: PayloadAction<Shop>) => {
      const index = state.shops.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.shops[index] = action.payload
      }
    },
    removeShop: (state, action: PayloadAction<string>) => {
      state.shops = state.shops.filter(s => s.id !== action.payload)
    }
  }
})

export const {
  setShops,
  setSelectedShop,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  addShop,
  updateShop,
  removeShop
} = shopsSlice.actions

export default shopsSlice.reducer