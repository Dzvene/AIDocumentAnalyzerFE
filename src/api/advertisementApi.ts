import { apiClient } from './config'
import {
  AdCampaign,
  CreateAdCampaignRequest,
  UpdateAdCampaignRequest,
  AdCampaignSearchParams,
  AdCampaignListResponse,
  AdCampaignResponse,
  AdAnalyticsResponse,
  AdBillingListResponse,
  AdPackageListResponse,
  AdClickEvent,
  AdImpressionEvent,
  AdAnalytics,
  ApiResponse
} from '@types/dto/advertisement.dto'

export const advertisementApi = {
  // Campaign management
  getCampaigns: async (params?: AdCampaignSearchParams): Promise<AdCampaignListResponse> => {
    return apiClient.get<AdCampaignListResponse>('/api/advertisement/campaigns', { params })
  },

  createCampaign: async (data: CreateAdCampaignRequest): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>('/api/advertisement/campaigns', data)
  },

  getCampaignById: async (id: string): Promise<AdCampaignResponse> => {
    return apiClient.get<AdCampaignResponse>(`/api/advertisement/campaigns/${id}`)
  },

  updateCampaign: async (id: string, data: UpdateAdCampaignRequest): Promise<AdCampaignResponse> => {
    return apiClient.put<AdCampaignResponse>(`/api/advertisement/campaigns/${id}`, data)
  },

  deleteCampaign: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/advertisement/campaigns/${id}`)
  },

  // Campaign status management
  pauseCampaign: async (id: string): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>(`/api/advertisement/campaigns/${id}/pause`)
  },

  resumeCampaign: async (id: string): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>(`/api/advertisement/campaigns/${id}/resume`)
  },

  completeCampaign: async (id: string): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>(`/api/advertisement/campaigns/${id}/complete`)
  },

  cancelCampaign: async (id: string): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>(`/api/advertisement/campaigns/${id}/cancel`)
  },

  // Active ads for display
  getActiveAds: async (params?: {
    placement?: string
    limit?: number
    userId?: string
    sessionId?: string
    location?: { latitude: number; longitude: number }
  }): Promise<ApiResponse<AdCampaign[]>> => {
    return apiClient.get<ApiResponse<AdCampaign[]>>('/api/advertisement/active-ads', { params })
  },

  // Premium slider ads (for homepage carousel)
  getPremiumSliderAds: async (params?: {
    limit?: number
    location?: { latitude: number; longitude: number }
    radius?: number
  }): Promise<ApiResponse<AdCampaign[]>> => {
    return apiClient.get<ApiResponse<AdCampaign[]>>('/api/advertisement/premium-slider', { params })
  },

  // Featured ads
  getFeaturedAds: async (params?: {
    category?: string
    limit?: number
    location?: { latitude: number; longitude: number }
  }): Promise<ApiResponse<AdCampaign[]>> => {
    return apiClient.get<ApiResponse<AdCampaign[]>>('/api/advertisement/featured', { params })
  },

  // Tracking
  trackClick: async (data: {
    campaignId: string
    sessionId: string
    userId?: string
    placement?: string
  }): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/advertisement/track-click', data)
  },

  trackImpression: async (data: {
    campaignId: string
    sessionId: string
    userId?: string
    placement: string
    isViewable: boolean
  }): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/advertisement/track-impression', data)
  },

  trackConversion: async (data: {
    campaignId: string
    orderId: string
    amount: number
    userId?: string
  }): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/advertisement/track-conversion', data)
  },

  // Bulk tracking (for performance)
  trackBulkImpressions: async (impressions: AdImpressionEvent[]): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/advertisement/track-bulk-impressions', { impressions })
  },

  // Analytics
  getCampaignAnalytics: async (campaignId: string, params?: {
    period?: AdAnalytics['period']
    startDate?: string
    endDate?: string
  }): Promise<AdAnalyticsResponse> => {
    return apiClient.get<AdAnalyticsResponse>(`/api/advertisement/campaigns/${campaignId}/analytics`, { params })
  },

  getVendorAnalytics: async (vendorId: string, params?: {
    period?: AdAnalytics['period']
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{
    campaigns: AdAnalytics[]
    summary: {
      totalCampaigns: number
      totalImpressions: number
      totalClicks: number
      totalSpent: number
      avgCtr: number
      avgRoi: number
    }
  }>> => {
    return apiClient.get<ApiResponse<{
      campaigns: AdAnalytics[]
      summary: any
    }>>(`/api/advertisement/vendors/${vendorId}/analytics`, { params })
  },

  // Billing
  getAdBilling: async (params?: {
    vendorId?: string
    campaignId?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<AdBillingListResponse> => {
    return apiClient.get<AdBillingListResponse>('/api/advertisement/billing', { params })
  },

  addCredit: async (data: {
    vendorId: string
    amount: number
    paymentMethod: string
  }): Promise<ApiResponse<{
    transactionId: string
    balance: number
  }>> => {
    return apiClient.post<ApiResponse<{
      transactionId: string
      balance: number
    }>>('/api/advertisement/billing/add-credit', data)
  },

  getBalance: async (vendorId: string): Promise<ApiResponse<{
    balance: number
    reserved: number
    available: number
  }>> => {
    return apiClient.get<ApiResponse<{
      balance: number
      reserved: number
      available: number
    }>>(`/api/advertisement/billing/balance/${vendorId}`)
  },

  // Packages
  getAdPackages: async (): Promise<AdPackageListResponse> => {
    return apiClient.get<AdPackageListResponse>('/api/advertisement/packages')
  },

  purchasePackage: async (packageId: string, data: {
    vendorId: string
    paymentMethod: string
  }): Promise<ApiResponse<{
    campaignId: string
    transactionId: string
  }>> => {
    return apiClient.post<ApiResponse<{
      campaignId: string
      transactionId: string
    }>>(`/api/advertisement/packages/${packageId}/purchase`, data)
  },

  // Campaign templates
  getCampaignTemplates: async (type?: string): Promise<ApiResponse<Array<{
    id: string
    name: string
    description: string
    type: string
    template: Partial<CreateAdCampaignRequest>
  }>>> => {
    return apiClient.get<ApiResponse<Array<any>>>('/api/advertisement/templates', {
      params: { type }
    })
  },

  // Media upload
  uploadAdMedia: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('media', file)

    return apiClient.post<ApiResponse<{ url: string }>>('/api/advertisement/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Admin endpoints
  approveCampaign: async (id: string): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>(`/api/advertisement/campaigns/${id}/approve`)
  },

  rejectCampaign: async (id: string, reason: string): Promise<AdCampaignResponse> => {
    return apiClient.post<AdCampaignResponse>(`/api/advertisement/campaigns/${id}/reject`, { reason })
  },

  // Reports
  generateReport: async (params: {
    vendorId?: string
    campaignIds?: string[]
    startDate: string
    endDate: string
    format: 'pdf' | 'excel' | 'csv'
  }): Promise<Blob> => {
    return apiClient.post<Blob>('/api/advertisement/reports/generate', params, {
      responseType: 'blob'
    })
  },

  // Audience insights
  getAudienceInsights: async (params?: {
    location?: { latitude: number; longitude: number; radius: number }
    categories?: string[]
  }): Promise<ApiResponse<{
    totalReach: number
    demographics: {
      age: Array<{ range: string; percentage: number }>
      gender: Array<{ type: string; percentage: number }>
      interests: Array<{ name: string; count: number }>
    }
    peakHours: Array<{ hour: number; activity: number }>
    deviceUsage: Array<{ type: string; percentage: number }>
  }>> => {
    return apiClient.get<ApiResponse<any>>('/api/advertisement/audience-insights', { params })
  }
}