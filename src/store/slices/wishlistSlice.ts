import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '../../types/interfaces/product'

interface WishlistState {
  items: Product[]
  loading: boolean
  error: string | null
  totalItems: number
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload
      state.totalItems = action.payload.length
      state.loading = false
      state.error = null
    },
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find(item => item.id === action.payload.id)
      if (!exists) {
        state.items.push(action.payload)
        state.totalItems = state.items.length
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.totalItems = state.items.length
    },
    clearWishlist: (state) => {
      state.items = []
      state.totalItems = 0
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    toggleWishlistItem: (state, action: PayloadAction<Product>) => {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id)
      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1)
      } else {
        state.items.push(action.payload)
      }
      state.totalItems = state.items.length
    },
    syncWishlist: (state, action: PayloadAction<string[]>) => {
      const productIds = action.payload
      state.items = state.items.filter(item => productIds.includes(item.id))
      state.totalItems = state.items.length
    }
  }
})

export const {
  setWishlistItems,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setLoading,
  setError,
  toggleWishlistItem,
  syncWishlist
} = wishlistSlice.actions

export default wishlistSlice.reducer