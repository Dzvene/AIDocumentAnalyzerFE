import { apiClient } from './config'
import {
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListRequest,
  ProductListResponse,
  ProductResponse,
  ProductReviewsResponse,
  ProductInventoryUpdate,
  ApiResponse
} from '@types/dto/product.dto'

export const productsApi = {
  // Core product endpoints
  getProducts: async (params?: ProductListRequest): Promise<ProductListResponse> => {
    return apiClient.get<ProductListResponse>('/api/products', { params })
  },

  createProduct: async (data: CreateProductRequest): Promise<ProductResponse> => {
    return apiClient.post<ProductResponse>('/api/products', data)
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    return apiClient.get<ProductResponse>(`/api/products/${id}`)
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<ProductResponse> => {
    return apiClient.put<ProductResponse>(`/api/products/${id}`, data)
  },

  deleteProduct: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/products/${id}`)
  },

  // Vendor products
  getVendorProducts: async (vendorId: string, params?: ProductListRequest): Promise<ProductListResponse> => {
    return apiClient.get<ProductListResponse>(`/api/products/vendor/${vendorId}`, { params })
  },

  // Category products
  getCategoryProducts: async (categoryId: string, params?: ProductListRequest): Promise<ProductListResponse> => {
    return apiClient.get<ProductListResponse>(`/api/products/category/${categoryId}`, { params })
  },

  // Featured products
  getFeaturedProducts: async (limit?: number): Promise<ProductListResponse> => {
    return apiClient.get<ProductListResponse>('/api/products/featured', {
      params: { limit }
    })
  },

  // Top categories
  getTopCategories: async (limit?: number): Promise<any[]> => {
    return apiClient.get<any[]>('/api/products/top-categories', {
      params: { limit }
    })
  },

  // Popular products
  getPopularProducts: async (params?: {
    limit?: number
    period?: 'day' | 'week' | 'month'
    categoryId?: string
  }): Promise<ProductListResponse> => {
    return apiClient.get<ProductListResponse>('/api/products/popular', { params })
  },

  // Related products
  getRelatedProducts: async (productId: string, limit?: number): Promise<ProductListResponse> => {
    return apiClient.get<ProductListResponse>(`/api/products/${productId}/related`, {
      params: { limit }
    })
  },

  // Product inventory
  updateInventory: async (updates: ProductInventoryUpdate[]): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/products/inventory/update', { updates })
  },

  checkAvailability: async (productIds: string[]): Promise<ApiResponse<{
    available: { [productId: string]: boolean }
    quantities: { [productId: string]: number }
  }>> => {
    return apiClient.post<ApiResponse<{
      available: { [productId: string]: boolean }
      quantities: { [productId: string]: number }
    }>>('/api/products/check-availability', { productIds })
  },

  // Product status
  activateProduct: async (id: string): Promise<ProductResponse> => {
    return apiClient.post<ProductResponse>(`/api/products/${id}/activate`)
  },

  deactivateProduct: async (id: string): Promise<ProductResponse> => {
    return apiClient.post<ProductResponse>(`/api/products/${id}/deactivate`)
  },

  // Product reviews
  getProductReviews: async (productId: string, params?: {
    page?: number
    pageSize?: number
    sortBy?: 'rating' | 'date' | 'helpful'
    sortDirection?: 'asc' | 'desc'
  }): Promise<ProductReviewsResponse> => {
    return apiClient.get<ProductReviewsResponse>(`/api/products/${productId}/reviews`, { params })
  },

  createReview: async (productId: string, data: {
    rating: number
    title?: string
    comment: string
    images?: string[]
    orderId?: string
  }): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>(`/api/products/${productId}/reviews`, data)
  },

  // Product images
  uploadProductImages: async (productId: string, files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    return apiClient.post<ApiResponse<{ urls: string[] }>>(`/api/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  deleteProductImage: async (productId: string, imageUrl: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/products/${productId}/images`, {
      data: { imageUrl }
    })
  },

  // Bulk operations
  bulkUpdateProducts: async (updates: Array<{ id: string } & Partial<UpdateProductRequest>>): Promise<ApiResponse<{
    updated: ProductDto[]
    failed: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.put<ApiResponse<{
      updated: ProductDto[]
      failed: Array<{ id: string; error: string }>
    }>>('/api/products/bulk-update', { updates })
  },

  bulkDeleteProducts: async (productIds: string[]): Promise<ApiResponse<{
    deleted: number
    failed: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.delete<ApiResponse<{
      deleted: number
      failed: Array<{ id: string; error: string }>
    }>>('/api/products/bulk-delete', { productIds })
  },

  // Import/Export
  exportProducts: async (format: 'csv' | 'json' | 'xlsx', filters?: ProductListRequest): Promise<Blob> => {
    return apiClient.get<Blob>('/api/products/export', {
      params: { format, ...filters },
      responseType: 'blob'
    })
  },

  importProducts: async (file: File, vendorId: string): Promise<ApiResponse<{
    imported: number
    updated: number
    failed: Array<{
      row: number
      error: string
    }>
  }>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('vendorId', vendorId)

    return apiClient.post<ApiResponse<{
      imported: number
      updated: number
      failed: Array<{
        row: number
        error: string
      }>
    }>>('/api/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}