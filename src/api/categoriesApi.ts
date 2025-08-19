import { apiClient } from './config'
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListRequest,
  CategoryTreeRequest,
  CategoryListResponse,
  CategoryResponse,
  CategoryTreeResponse,
  CategoryStatsResponse,
  BulkCategoryResponse,
  CategoryStats
} from '@types/dto/category.dto'

export const categoriesApi = {
  // Get categories
  getCategories: async (params?: CategoryListRequest): Promise<CategoryListResponse> => {
    return apiClient.get<CategoryListResponse>('/api/categories', { params })
  },

  getAllCategories: async (params?: CategoryListRequest): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/api/categories/all', { params })
  },

  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`/api/categories/${id}`)
  },

  getCategoryBySlug: async (slug: string): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`/api/categories/slug/${slug}`)
  },

  // Category tree and hierarchy
  getCategoryTree: async (params?: CategoryTreeRequest): Promise<CategoryTreeResponse> => {
    return apiClient.get<CategoryTreeResponse>('/api/categories/tree', { params })
  },

  getCategoryPath: async (categoryId: string): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>(`/api/categories/${categoryId}/path`)
  },

  getCategoryChildren: async (parentId: string, includeInactive: boolean = false): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>(`/api/categories/${parentId}/children`, {
      params: { includeInactive }
    })
  },

  getCategoryAncestors: async (categoryId: string): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>(`/api/categories/${categoryId}/ancestors`)
  },

  getCategoryDescendants: async (categoryId: string, maxLevel?: number): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>(`/api/categories/${categoryId}/descendants`, {
      params: { maxLevel }
    })
  },

  // Popular and featured categories
  getPopularCategories: async (limit: number = 10, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/api/categories/popular', {
      params: { limit, period }
    })
  },

  getFeaturedCategories: async (limit: number = 8): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/api/categories/featured', {
      params: { limit }
    })
  },

  getTrendingCategories: async (limit: number = 10): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/api/categories/trending', {
      params: { limit }
    })
  },

  // Category management (admin)
  createCategory: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>('/api/categories', data)
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
    return apiClient.put<CategoryResponse>(`/api/categories/${id}`, data)
  },

  deleteCategory: async (id: string, moveProductsTo?: string): Promise<{ message: string }> => {
    const params = moveProductsTo ? { moveProductsTo } : {}
    return apiClient.delete<{ message: string }>(`/api/categories/${id}`, { params })
  },

  // Category ordering
  reorderCategories: async (updates: Array<{ id: string; sortOrder: number; parentCategoryId?: string }>): Promise<BulkCategoryResponse> => {
    return apiClient.post<BulkCategoryResponse>('/api/categories/reorder', { updates })
  },

  moveCategory: async (categoryId: string, newParentId: string | null): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(`/api/categories/${categoryId}/move`, { newParentId })
  },

  // Category status
  toggleCategoryStatus: async (id: string): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(`/api/categories/${id}/toggle-status`)
  },

  activateCategory: async (id: string): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(`/api/categories/${id}/activate`)
  },

  deactivateCategory: async (id: string): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(`/api/categories/${id}/deactivate`)
  },

  // Bulk operations
  bulkUpdateCategories: async (updates: Array<{ id: string } & Partial<UpdateCategoryRequest>>): Promise<BulkCategoryResponse> => {
    return apiClient.post<BulkCategoryResponse>('/api/categories/bulk-update', { updates })
  },

  bulkDeleteCategories: async (categoryIds: string[], moveProductsTo?: string): Promise<BulkCategoryResponse> => {
    return apiClient.post<BulkCategoryResponse>('/api/categories/bulk-delete', { categoryIds, moveProductsTo })
  },

  // Category statistics
  getCategoryStats: async (categoryId?: string): Promise<CategoryStatsResponse> => {
    const params = categoryId ? { categoryId } : {}
    return apiClient.get<CategoryStatsResponse>('/api/categories/stats', { params })
  },

  getCategoryProductCount: async (categoryId: string, includeSubcategories: boolean = true): Promise<{
    count: number
    activeCount: number
    subcategoryCount?: Record<string, number>
  }> => {
    return apiClient.get<{
      count: number
      activeCount: number
      subcategoryCount?: Record<string, number>
    }>(`/api/categories/${categoryId}/product-count`, {
      params: { includeSubcategories }
    })
  },

  // Category search and suggestions
  searchCategories: async (query: string, limit: number = 10): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/api/categories/search', {
      params: { query, limit }
    })
  },

  getCategorySuggestions: async (parentId?: string, limit: number = 5): Promise<Array<{
    name: string
    slug: string
    confidence: number
  }>> => {
    return apiClient.get<Array<{
      name: string
      slug: string
      confidence: number
    }>>('/api/categories/suggestions', {
      params: { parentId, limit }
    })
  },

  // Category validation
  validateCategorySlug: async (slug: string, excludeId?: string): Promise<{
    isValid: boolean
    isAvailable: boolean
    suggestions?: string[]
  }> => {
    return apiClient.post<{
      isValid: boolean
      isAvailable: boolean
      suggestions?: string[]
    }>('/api/categories/validate-slug', { slug, excludeId })
  },

  checkCategoryHierarchy: async (parentId: string, childId: string): Promise<{
    isValid: boolean
    wouldCreateCycle: boolean
    maxDepthExceeded: boolean
  }> => {
    return apiClient.post<{
      isValid: boolean
      wouldCreateCycle: boolean
      maxDepthExceeded: boolean
    }>('/api/categories/validate-hierarchy', { parentId, childId })
  },

  // Import/Export
  exportCategories: async (format: 'csv' | 'json' | 'xlsx', includeProducts: boolean = false): Promise<Blob> => {
    return apiClient.get<Blob>('/api/categories/export', {
      params: { format, includeProducts },
      responseType: 'blob'
    })
  },

  importCategories: async (file: File, options?: {
    updateExisting?: boolean
    createMissing?: boolean
    skipInvalid?: boolean
  }): Promise<{
    imported: number
    updated: number
    skipped: number
    errors: Array<{
      row: number
      category: string
      error: string
    }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return apiClient.post<{
      imported: number
      updated: number
      skipped: number
      errors: Array<{
        row: number
        category: string
        error: string
      }>
    }>('/api/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Category templates
  getCategoryTemplates: async (): Promise<Array<{
    id: string
    name: string
    description: string
    categories: CategoryDto[]
  }>> => {
    return apiClient.get<Array<{
      id: string
      name: string
      description: string
      categories: CategoryDto[]
    }>>('/api/categories/templates')
  },

  applyCategoryTemplate: async (templateId: string, parentId?: string): Promise<{
    message: string
    createdCategories: CategoryDto[]
  }> => {
    return apiClient.post<{
      message: string
      createdCategories: CategoryDto[]
    }>(`/api/categories/templates/${templateId}/apply`, { parentId })
  }
}