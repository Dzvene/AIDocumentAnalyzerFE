import { apiClient } from './config'
import {
  VendorDto,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorSearchParams,
  VendorListResponse,
  VendorResponse,
  VendorStatisticsResponse,
  VendorReviewsResponse,
  VendorSubscriptionResponse,
  VendorStatistics,
  VendorReview,
  ApiResponse
} from '@types/dto/vendor.dto'

export const vendorsApi = {
  // Core vendor endpoints
  getVendors: async (params?: VendorSearchParams): Promise<VendorListResponse> => {
    return apiClient.get<VendorListResponse>('/api/vendors', { params })
  },

  createVendor: async (data: CreateVendorRequest): Promise<VendorResponse> => {
    return apiClient.post<VendorResponse>('/api/vendors', data)
  },

  getVendorById: async (id: string): Promise<VendorResponse> => {
    return apiClient.get<VendorResponse>(`/api/vendors/${id}`)
  },

  updateVendor: async (id: string, data: UpdateVendorRequest): Promise<VendorResponse> => {
    return apiClient.put<VendorResponse>(`/api/vendors/${id}`, data)
  },

  deleteVendor: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/vendors/${id}`)
  },

  // Current user's vendor
  getMyVendor: async (): Promise<VendorResponse> => {
    return apiClient.get<VendorResponse>('/api/vendors/my-vendor')
  },

  // Geolocation-based search
  searchNearbyVendors: async (params: {
    latitude: number
    longitude: number
    radius: number
    category?: string
    deliveryType?: string
    minRating?: number
    isPremium?: boolean
  }): Promise<VendorListResponse> => {
    return apiClient.get<VendorListResponse>('/api/vendors/nearby', { params })
  },

  // Premium vendors for carousel
  getPremiumVendors: async (params?: {
    latitude?: number
    longitude?: number
    radius?: number
    limit?: number
  }): Promise<VendorListResponse> => {
    return apiClient.get<VendorListResponse>('/api/vendors/premium', { params })
  },

  // Featured vendors
  getFeaturedVendors: async (limit: number = 10): Promise<VendorListResponse> => {
    return apiClient.get<VendorListResponse>('/api/vendors/featured', {
      params: { limit }
    })
  },

  // Top rated vendors
  getTopRatedVendors: async (params?: {
    limit?: number
    minRating?: number
    category?: string
  }): Promise<VendorListResponse> => {
    return apiClient.get<VendorListResponse>('/api/vendors/top-rated', { params })
  },

  // Vendor verification
  requestVerification: async (vendorId: string): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>(`/api/vendors/${vendorId}/request-verification`)
  },

  submitVerificationDocuments: async (vendorId: string, files: File[]): Promise<ApiResponse> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`documents`, file)
    })

    return apiClient.post<ApiResponse>(`/api/vendors/${vendorId}/verification-documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Vendor status management (admin)
  approveVendor: async (id: string): Promise<VendorResponse> => {
    return apiClient.post<VendorResponse>(`/api/vendors/${id}/approve`)
  },

  rejectVendor: async (id: string, reason: string): Promise<VendorResponse> => {
    return apiClient.post<VendorResponse>(`/api/vendors/${id}/reject`, { reason })
  },

  suspendVendor: async (id: string, reason: string, duration?: number): Promise<VendorResponse> => {
    return apiClient.post<VendorResponse>(`/api/vendors/${id}/suspend`, { reason, duration })
  },

  activateVendor: async (id: string): Promise<VendorResponse> => {
    return apiClient.post<VendorResponse>(`/api/vendors/${id}/activate`)
  },

  // Vendor statistics
  getVendorStatistics: async (vendorId: string, period: VendorStatistics['period']): Promise<VendorStatisticsResponse> => {
    return apiClient.get<VendorStatisticsResponse>(`/api/vendors/${vendorId}/statistics`, {
      params: { period }
    })
  },

  getMyStatistics: async (period: VendorStatistics['period']): Promise<VendorStatisticsResponse> => {
    return apiClient.get<VendorStatisticsResponse>('/api/vendors/my-vendor/statistics', {
      params: { period }
    })
  },

  // Vendor reviews
  getVendorReviews: async (vendorId: string, params?: {
    page?: number
    pageSize?: number
    sortBy?: 'rating' | 'date' | 'helpful'
    sortDirection?: 'asc' | 'desc'
  }): Promise<VendorReviewsResponse> => {
    return apiClient.get<VendorReviewsResponse>(`/api/vendors/${vendorId}/reviews`, { params })
  },

  respondToReview: async (vendorId: string, reviewId: string, response: string): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>(`/api/vendors/${vendorId}/reviews/${reviewId}/response`, { response })
  },

  reportReview: async (vendorId: string, reviewId: string, reason: string): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>(`/api/vendors/${vendorId}/reviews/${reviewId}/report`, { reason })
  },

  // Vendor subscription management
  getVendorSubscription: async (vendorId: string): Promise<VendorSubscriptionResponse> => {
    return apiClient.get<VendorSubscriptionResponse>(`/api/vendors/${vendorId}/subscription`)
  },

  upgradeSubscription: async (vendorId: string, tier: 'Professional' | 'Enterprise'): Promise<VendorSubscriptionResponse> => {
    return apiClient.post<VendorSubscriptionResponse>(`/api/vendors/${vendorId}/subscription/upgrade`, { tier })
  },

  downgradeSubscription: async (vendorId: string, tier: 'Basic' | 'Professional'): Promise<VendorSubscriptionResponse> => {
    return apiClient.post<VendorSubscriptionResponse>(`/api/vendors/${vendorId}/subscription/downgrade`, { tier })
  },

  cancelSubscription: async (vendorId: string): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>(`/api/vendors/${vendorId}/subscription/cancel`)
  },

  // Vendor delivery settings
  updateDeliverySettings: async (vendorId: string, settings: {
    deliveryRadius: number
    deliveryOptions: {
      ownDelivery: boolean
      thirdPartyDelivery: boolean
      courierDelivery: boolean
      selfPickup: boolean
      marketplaceDelivery: boolean
    }
    minOrderAmount: number
    averageDeliveryTime: string
    deliveryFee: number
  }): Promise<VendorResponse> => {
    return apiClient.put<VendorResponse>(`/api/vendors/${vendorId}/delivery-settings`, settings)
  },

  // Vendor business hours
  updateBusinessHours: async (vendorId: string, businessHours: {
    [day: string]: {
      open: string
      close: string
      isClosed: boolean
    }
  }): Promise<VendorResponse> => {
    return apiClient.put<VendorResponse>(`/api/vendors/${vendorId}/business-hours`, businessHours)
  },

  // Vendor media
  uploadLogo: async (vendorId: string, file: File): Promise<ApiResponse<{ logoUrl: string }>> => {
    const formData = new FormData()
    formData.append('logo', file)

    return apiClient.post<ApiResponse<{ logoUrl: string }>>(`/api/vendors/${vendorId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  uploadBanner: async (vendorId: string, file: File): Promise<ApiResponse<{ bannerUrl: string }>> => {
    const formData = new FormData()
    formData.append('banner', file)

    return apiClient.post<ApiResponse<{ bannerUrl: string }>>(`/api/vendors/${vendorId}/banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Bulk operations (admin)
  bulkUpdateVendors: async (updates: Array<{ id: string } & Partial<UpdateVendorRequest>>): Promise<ApiResponse<{
    updated: VendorDto[]
    errors: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.put<ApiResponse<{
      updated: VendorDto[]
      errors: Array<{ id: string; error: string }>
    }>>('/api/vendors/bulk-update', { updates })
  },

  bulkApproveVendors: async (vendorIds: string[]): Promise<ApiResponse<{
    approved: VendorDto[]
    errors: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.post<ApiResponse<{
      approved: VendorDto[]
      errors: Array<{ id: string; error: string }>
    }>>('/api/vendors/bulk-approve', { vendorIds })
  },

  // Export/Import (admin)
  exportVendors: async (format: 'csv' | 'json' | 'xlsx', filters?: VendorSearchParams): Promise<Blob> => {
    return apiClient.get<Blob>('/api/vendors/export', {
      params: { format, ...filters },
      responseType: 'blob'
    })
  },

  importVendors: async (file: File): Promise<ApiResponse<{
    imported: number
    errors: Array<{
      row: number
      error: string
    }>
  }>> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post<ApiResponse<{
      imported: number
      errors: Array<{
        row: number
        error: string
      }>
    }>>('/api/vendors/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Check vendor slug availability
  checkSlugAvailability: async (slug: string): Promise<ApiResponse<{ available: boolean }>> => {
    return apiClient.get<ApiResponse<{ available: boolean }>>(`/api/vendors/check-slug/${slug}`)
  }
}