import { apiClient } from './config'
import { PaginatedResponse } from '@types/interfaces/common'

interface Coupon {
  id: string
  code: string
  title: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  userUsageLimit?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  excludedProducts?: string[]
  excludedCategories?: string[]
  vendorId?: string
  isPublic: boolean
  stackable: boolean
  createdAt: string
  updatedAt: string
}

interface CreateCouponRequest {
  code: string
  title: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  startDate: string
  endDate: string
  isActive?: boolean
  usageLimit?: number
  userUsageLimit?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  excludedProducts?: string[]
  excludedCategories?: string[]
  vendorId?: string
  isPublic?: boolean
  stackable?: boolean
}

interface UpdateCouponRequest {
  code?: string
  title?: string
  description?: string
  type?: 'percentage' | 'fixed_amount' | 'free_shipping'
  value?: number
  minimumAmount?: number
  maximumDiscount?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
  usageLimit?: number
  userUsageLimit?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  excludedProducts?: string[]
  excludedCategories?: string[]
  isPublic?: boolean
  stackable?: boolean
}

interface CouponFilters {
  search?: string
  type?: Coupon['type']
  isActive?: boolean
  vendorId?: string
  isPublic?: boolean
  startDate?: string
  endDate?: string
  sortBy?: 'code' | 'value' | 'usage' | 'created'
  sortOrder?: 'asc' | 'desc'
}

interface CouponUsage {
  id: string
  couponId: string
  userId: string
  orderId: string
  discountAmount: number
  usedAt: string
}

interface CouponValidationRequest {
  code: string
  cartItems?: Array<{
    productId: string
    quantity: number
    price: number
  }>
  cartTotal?: number
  userId?: string
}

interface CouponValidationResponse {
  isValid: boolean
  coupon?: Coupon
  discountAmount?: number
  reason?: string
  suggestions?: Coupon[]
}

export const couponsApi = {
  // Get coupons
  getCoupons: async (params?: CouponFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>> => {
    return apiClient.get<PaginatedResponse<Coupon>>('/coupons', { params })
  },

  getCouponById: async (id: string): Promise<Coupon> => {
    return apiClient.get<Coupon>(`/coupons/${id}`)
  },

  getCouponByCode: async (code: string): Promise<Coupon> => {
    return apiClient.get<Coupon>(`/coupons/code/${code}`)
  },

  // Public coupons
  getPublicCoupons: async (params?: Omit<CouponFilters, 'isPublic'> & { page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>> => {
    return apiClient.get<PaginatedResponse<Coupon>>('/coupons/public', { params })
  },

  getActiveCoupons: async (params?: Omit<CouponFilters, 'isActive'> & { page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>> => {
    return apiClient.get<PaginatedResponse<Coupon>>('/coupons/active', { params })
  },

  getExpiringSoon: async (days: number = 7): Promise<Coupon[]> => {
    return apiClient.get<Coupon[]>('/coupons/expiring-soon', {
      params: { days }
    })
  },

  // Coupon validation and application
  validateCoupon: async (data: CouponValidationRequest): Promise<CouponValidationResponse> => {
    return apiClient.post<CouponValidationResponse>('/coupons/validate', data)
  },

  applyCoupon: async (code: string, cartData: {
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    subtotal: number
  }): Promise<{
    isValid: boolean
    coupon?: Coupon
    discountAmount: number
    newTotal: number
  }> => {
    return apiClient.post<{
      isValid: boolean
      coupon?: Coupon
      discountAmount: number
      newTotal: number
    }>('/coupons/apply', { code, ...cartData })
  },

  // Coupon management
  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    return apiClient.post<Coupon>('/coupons', data)
  },

  updateCoupon: async (id: string, data: UpdateCouponRequest): Promise<Coupon> => {
    return apiClient.patch<Coupon>(`/coupons/${id}`, data)
  },

  deleteCoupon: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/coupons/${id}`)
  },

  // Coupon status
  activateCoupon: async (id: string): Promise<Coupon> => {
    return apiClient.patch<Coupon>(`/coupons/${id}/activate`)
  },

  deactivateCoupon: async (id: string): Promise<Coupon> => {
    return apiClient.patch<Coupon>(`/coupons/${id}/deactivate`)
  },

  extendCoupon: async (id: string, newEndDate: string): Promise<Coupon> => {
    return apiClient.patch<Coupon>(`/coupons/${id}/extend`, { newEndDate })
  },

  duplicateCoupon: async (id: string, modifications?: Partial<CreateCouponRequest>): Promise<Coupon> => {
    return apiClient.post<Coupon>(`/coupons/${id}/duplicate`, modifications)
  },

  // Code generation and validation
  generateCouponCode: async (params?: {
    prefix?: string
    length?: number
    includeNumbers?: boolean
    includeLetters?: boolean
    excludeSimilar?: boolean
  }): Promise<{ code: string }> => {
    return apiClient.post<{ code: string }>('/coupons/generate-code', params)
  },

  checkCodeAvailability: async (code: string): Promise<{ available: boolean; suggestions?: string[] }> => {
    return apiClient.post<{ available: boolean; suggestions?: string[] }>('/coupons/check-code', { code })
  },

  // Usage tracking
  getCouponUsage: async (id: string, params?: {
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<CouponUsage>> => {
    return apiClient.get<PaginatedResponse<CouponUsage>>(`/coupons/${id}/usage`, { params })
  },

  getCouponStats: async (id: string): Promise<{
    totalUsage: number
    totalSavings: number
    uniqueUsers: number
    conversionRate: number
    usageOverTime: Array<{
      date: string
      usage: number
      savings: number
    }>
  }> => {
    return apiClient.get<{
      totalUsage: number
      totalSavings: number
      uniqueUsers: number
      conversionRate: number
      usageOverTime: Array<{
        date: string
        usage: number
        savings: number
      }>
    }>(`/coupons/${id}/stats`)
  },

  // Vendor coupons
  getVendorCoupons: async (vendorId: string, params?: Omit<CouponFilters, 'vendorId'> & { page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>> => {
    return apiClient.get<PaginatedResponse<Coupon>>(`/vendors/${vendorId}/coupons`, { params })
  },

  createVendorCoupon: async (vendorId: string, data: Omit<CreateCouponRequest, 'vendorId'>): Promise<Coupon> => {
    return apiClient.post<Coupon>(`/vendors/${vendorId}/coupons`, data)
  },

  // Bulk operations
  bulkUpdateCoupons: async (updates: Array<{ id: string } & Partial<UpdateCouponRequest>>): Promise<{
    updated: Coupon[]
    errors: Array<{ id: string; error: string }>
  }> => {
    return apiClient.patch<{
      updated: Coupon[]
      errors: Array<{ id: string; error: string }>
    }>('/coupons/bulk-update', { updates })
  },

  bulkDeleteCoupons: async (couponIds: string[]): Promise<{
    message: string
    deletedCount: number
    errors: Array<{ id: string; error: string }>
  }> => {
    return apiClient.post<{
      message: string
      deletedCount: number
      errors: Array<{ id: string; error: string }>
    }>('/coupons/bulk-delete', { couponIds })
  },

  bulkActivateCoupons: async (couponIds: string[]): Promise<{
    message: string
    activatedCount: number
    errors: Array<{ id: string; error: string }>
  }> => {
    return apiClient.patch<{
      message: string
      activatedCount: number
      errors: Array<{ id: string; error: string }>
    }>('/coupons/bulk-activate', { couponIds })
  },

  bulkDeactivateCoupons: async (couponIds: string[]): Promise<{
    message: string
    deactivatedCount: number
    errors: Array<{ id: string; error: string }>
  }> => {
    return apiClient.patch<{
      message: string
      deactivatedCount: number
      errors: Array<{ id: string; error: string }>
    }>('/coupons/bulk-deactivate', { couponIds })
  },

  // Import/Export
  exportCoupons: async (format: 'csv' | 'json' | 'xlsx', filters?: CouponFilters): Promise<Blob> => {
    return apiClient.get<Blob>('/coupons/export', {
      params: { format, ...filters },
      responseType: 'blob'
    })
  },

  importCoupons: async (file: File): Promise<{
    imported: number
    updated: number
    errors: Array<{
      row: number
      error: string
    }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post<{
      imported: number
      updated: number
      errors: Array<{
        row: number
        error: string
      }>
    }>('/coupons/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Analytics
  getCouponAnalytics: async (params?: {
    startDate?: string
    endDate?: string
    vendorId?: string
  }): Promise<{
    totalCoupons: number
    activeCoupons: number
    totalUsage: number
    totalSavings: number
    averageDiscount: number
    topCoupons: Array<{
      id: string
      code: string
      usage: number
      savings: number
    }>
    usageByType: Array<{
      type: string
      count: number
      percentage: number
    }>
  }> => {
    return apiClient.get<{
      totalCoupons: number
      activeCoupons: number
      totalUsage: number
      totalSavings: number
      averageDiscount: number
      topCoupons: Array<{
        id: string
        code: string
        usage: number
        savings: number
      }>
      usageByType: Array<{
        type: string
        count: number
        percentage: number
      }>
    }>('/coupons/analytics', { params })
  }
}