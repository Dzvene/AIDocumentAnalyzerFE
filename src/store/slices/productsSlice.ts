import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '../../types/interfaces/product'

interface ProductsState {
  products: Product[]
  selectedProduct: Product | null
  loading: boolean
  error: string | null
  filters: {
    category: string | null
    priceRange: [number, number] | null
    sortBy: 'price' | 'name' | 'rating' | null
    searchQuery: string
  }
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    priceRange: null,
    sortBy: null,
    searchQuery: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalItems: 0
  }
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action: PayloadAction<Partial<ProductsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = action.payload
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload)
    }
  }
})

export const {
  setProducts,
  setSelectedProduct,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  addProduct,
  updateProduct,
  removeProduct
} = productsSlice.actions

export default productsSlice.reducer