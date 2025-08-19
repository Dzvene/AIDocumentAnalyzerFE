import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '../../types/interfaces/product'
import { Shop } from '../../types/interfaces/shop'

interface SearchFilters {
  query: string
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  rating: number | null
  inStock: boolean | null
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'
  location: string | null
  brand: string | null
}

interface SearchResults {
  products: Product[]
  shops: Shop[]
  categories: string[]
  suggestions: string[]
  totalProducts: number
  totalShops: number
}

interface SearchHistory {
  id: string
  query: string
  timestamp: string
  results: number
}

interface SearchState {
  currentQuery: string
  filters: SearchFilters
  results: SearchResults
  searchHistory: SearchHistory[]
  suggestions: string[]
  popularSearches: string[]
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
  }
  recentSearches: string[]
}

const initialState: SearchState = {
  currentQuery: '',
  filters: {
    query: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    rating: null,
    inStock: null,
    sortBy: 'relevance',
    location: null,
    brand: null
  },
  results: {
    products: [],
    shops: [],
    categories: [],
    suggestions: [],
    totalProducts: 0,
    totalShops: 0
  },
  searchHistory: [],
  suggestions: [],
  popularSearches: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20
  },
  recentSearches: []
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload
      state.filters.query = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters, query: state.currentQuery }
    },
    setSearchResults: (state, action: PayloadAction<SearchResults>) => {
      state.results = action.payload
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
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload
    },
    setPopularSearches: (state, action: PayloadAction<string[]>) => {
      state.popularSearches = action.payload
    },
    addToSearchHistory: (state, action: PayloadAction<SearchHistory>) => {
      const existingIndex = state.searchHistory.findIndex(
        item => item.query.toLowerCase() === action.payload.query.toLowerCase()
      )
      
      if (existingIndex !== -1) {
        state.searchHistory.splice(existingIndex, 1)
      }
      
      state.searchHistory.unshift(action.payload)
      
      if (state.searchHistory.length > 50) {
        state.searchHistory = state.searchHistory.slice(0, 50)
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = []
    },
    removeFromSearchHistory: (state, action: PayloadAction<string>) => {
      state.searchHistory = state.searchHistory.filter(
        item => item.id !== action.payload
      )
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim().toLowerCase()
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query)
        if (state.recentSearches.length > 10) {
          state.recentSearches = state.recentSearches.slice(0, 10)
        }
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = []
    },
    setPagination: (state, action: PayloadAction<Partial<SearchState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearSearchResults: (state) => {
      state.results = initialState.results
      state.currentQuery = ''
      state.filters.query = ''
    },
    updateSearchCount: (state, action: PayloadAction<string>) => {
      const historyItem = state.searchHistory.find(
        item => item.query.toLowerCase() === action.payload.toLowerCase()
      )
      if (historyItem) {
        historyItem.results++
      }
    }
  }
})

export const {
  setCurrentQuery,
  setFilters,
  resetFilters,
  setSearchResults,
  setLoading,
  setError,
  setSuggestions,
  setPopularSearches,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory,
  addRecentSearch,
  clearRecentSearches,
  setPagination,
  clearSearchResults,
  updateSearchCount
} = searchSlice.actions

export default searchSlice.reducer