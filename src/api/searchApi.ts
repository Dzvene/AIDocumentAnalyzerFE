import { apiClient } from './config'
import { Product } from '@types/interfaces/product'
import { Shop } from '@types/interfaces/shop'
import { PaginatedResponse } from '@types/interfaces/common'

interface SearchFilters {
  query: string
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  inStock?: boolean
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular'
  location?: string
  brand?: string
  condition?: 'new' | 'used' | 'refurbished'
  shopId?: string
  hasDiscount?: boolean
  isFeatured?: boolean
}

interface SearchResults {
  products: Product[]
  shops: Shop[]
  categories: Array<{
    id: string
    name: string
    slug: string
    productCount: number
  }>
  brands: Array<{
    name: string
    productCount: number
  }>
  totalProducts: number
  totalShops: number
  searchTime: number
  query: string
  suggestions: string[]
  didYouMean?: string
}

interface SearchSuggestion {
  text: string
  type: 'product' | 'category' | 'brand' | 'shop'
  count: number
  image?: string
}

interface SearchHistory {
  id: string
  query: string
  filters?: Partial<SearchFilters>
  resultsCount: number
  timestamp: string
}

interface PopularSearch {
  query: string
  count: number
  category?: string
  trending?: boolean
}

interface AutocompleteResult {
  suggestions: SearchSuggestion[]
  products: Array<{
    id: string
    name: string
    image?: string
    price: number
    rating?: number
    shopName: string
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  shops: Array<{
    id: string
    name: string
    logo?: string
    rating?: number
  }>
}

export const searchApi = {
  // Main search
  search: async (params: SearchFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<SearchResults>> => {
    return apiClient.get<PaginatedResponse<SearchResults>>('/search', { params })
  },

  // Quick search (autocomplete)
  autocomplete: async (query: string, limit: number = 10): Promise<AutocompleteResult> => {
    return apiClient.get<AutocompleteResult>('/search/autocomplete', {
      params: { query, limit }
    })
  },

  // Search suggestions
  getSuggestions: async (query: string, type?: 'product' | 'category' | 'brand' | 'shop'): Promise<SearchSuggestion[]> => {
    return apiClient.get<SearchSuggestion[]>('/search/suggestions', {
      params: { query, type }
    })
  },

  // Popular searches
  getPopularSearches: async (category?: string, limit: number = 10): Promise<PopularSearch[]> => {
    return apiClient.get<PopularSearch[]>('/search/popular', {
      params: { category, limit }
    })
  },

  getTrendingSearches: async (period: 'day' | 'week' | 'month' = 'week', limit: number = 10): Promise<PopularSearch[]> => {
    return apiClient.get<PopularSearch[]>('/search/trending', {
      params: { period, limit }
    })
  },

  // Search history
  getSearchHistory: async (limit: number = 20): Promise<SearchHistory[]> => {
    return apiClient.get<SearchHistory[]>('/search/history', {
      params: { limit }
    })
  },

  addToSearchHistory: async (data: {
    query: string
    filters?: Partial<SearchFilters>
    resultsCount: number
  }): Promise<SearchHistory> => {
    return apiClient.post<SearchHistory>('/search/history', data)
  },

  clearSearchHistory: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/search/history')
  },

  removeFromSearchHistory: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/search/history/${id}`)
  },

  // Advanced search
  advancedSearch: async (params: {
    queries: Array<{
      field: 'name' | 'description' | 'tags' | 'category' | 'brand'
      operator: 'contains' | 'exact' | 'starts_with' | 'ends_with'
      value: string
      boost?: number
    }>
    filters?: Omit<SearchFilters, 'query'>
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<SearchResults>> => {
    return apiClient.post<PaginatedResponse<SearchResults>>('/search/advanced', params)
  },

  // Visual search (image-based)
  visualSearch: async (image: File, filters?: Omit<SearchFilters, 'query'>): Promise<SearchResults> => {
    const formData = new FormData()
    formData.append('image', image)
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      })
    }

    return apiClient.post<SearchResults>('/search/visual', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Voice search
  voiceSearch: async (audio: Blob, filters?: Omit<SearchFilters, 'query'>): Promise<SearchResults> => {
    const formData = new FormData()
    formData.append('audio', audio, 'voice-search.wav')
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      })
    }

    return apiClient.post<SearchResults>('/search/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Saved searches
  getSavedSearches: async (): Promise<Array<{
    id: string
    name: string
    query: string
    filters: Partial<SearchFilters>
    alertsEnabled: boolean
    createdAt: string
    lastExecuted?: string
  }>> => {
    return apiClient.get<Array<{
      id: string
      name: string
      query: string
      filters: Partial<SearchFilters>
      alertsEnabled: boolean
      createdAt: string
      lastExecuted?: string
    }>>('/search/saved')
  },

  saveSearch: async (data: {
    name: string
    query: string
    filters?: Partial<SearchFilters>
    alertsEnabled?: boolean
  }): Promise<{
    id: string
    name: string
    query: string
    filters: Partial<SearchFilters>
    alertsEnabled: boolean
    createdAt: string
  }> => {
    return apiClient.post<{
      id: string
      name: string
      query: string
      filters: Partial<SearchFilters>
      alertsEnabled: boolean
      createdAt: string
    }>('/search/saved', data)
  },

  updateSavedSearch: async (id: string, data: {
    name?: string
    query?: string
    filters?: Partial<SearchFilters>
    alertsEnabled?: boolean
  }): Promise<{
    id: string
    name: string
    query: string
    filters: Partial<SearchFilters>
    alertsEnabled: boolean
    createdAt: string
    updatedAt: string
  }> => {
    return apiClient.patch<{
      id: string
      name: string
      query: string
      filters: Partial<SearchFilters>
      alertsEnabled: boolean
      createdAt: string
      updatedAt: string
    }>(`/search/saved/${id}`, data)
  },

  deleteSavedSearch: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/search/saved/${id}`)
  },

  executeSavedSearch: async (id: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<SearchResults>> => {
    return apiClient.get<PaginatedResponse<SearchResults>>(`/search/saved/${id}/execute`, {
      params: { page, limit }
    })
  },

  // Search analytics
  getSearchAnalytics: async (params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
  }): Promise<{
    totalSearches: number
    uniqueQueries: number
    averageResultsPerSearch: number
    topQueries: Array<{
      query: string
      count: number
      avgResults: number
    }>
    noResultsQueries: Array<{
      query: string
      count: number
    }>
    categoryBreakdown: Array<{
      category: string
      searchCount: number
      percentage: number
    }>
    conversionRate: number
  }> => {
    return apiClient.get<{
      totalSearches: number
      uniqueQueries: number
      averageResultsPerSearch: number
      topQueries: Array<{
        query: string
        count: number
        avgResults: number
      }>
      noResultsQueries: Array<{
        query: string
        count: number
      }>
      categoryBreakdown: Array<{
        category: string
        searchCount: number
        percentage: number
      }>
      conversionRate: number
    }>('/search/analytics', { params })
  },

  // Search export
  exportSearchResults: async (params: SearchFilters, format: 'csv' | 'json' | 'xlsx'): Promise<Blob> => {
    return apiClient.get<Blob>('/search/export', {
      params: { ...params, format },
      responseType: 'blob'
    })
  },

  // Search indexing (admin)
  adminReindexProducts: async (): Promise<{ message: string; jobId: string }> => {
    return apiClient.post<{ message: string; jobId: string }>('/admin/search/reindex')
  },

  adminGetIndexStatus: async (): Promise<{
    totalProducts: number
    indexedProducts: number
    lastIndexed: string
    isIndexing: boolean
    errors?: string[]
  }> => {
    return apiClient.get<{
      totalProducts: number
      indexedProducts: number
      lastIndexed: string
      isIndexing: boolean
      errors?: string[]
    }>('/admin/search/status')
  }
}