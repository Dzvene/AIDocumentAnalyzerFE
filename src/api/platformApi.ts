import { apiClient } from './config'

export interface PlatformStatistics {
  totalVendors: number
  totalProducts: number
  totalCustomers: number
  averageRating: number
  totalOrders?: number
  activeVendors?: number
  newCustomersThisMonth?: number
  totalRevenue?: number
}

export interface PlatformInfo {
  name: string
  version: string
  description: string
  statistics: PlatformStatistics
}

export const platformApi = {
  // Get platform statistics
  getStatistics: async (): Promise<PlatformStatistics> => {
    return apiClient.get<PlatformStatistics>('/api/platform/statistics')
  },

  // Get full platform info including statistics
  getPlatformInfo: async (): Promise<PlatformInfo> => {
    return apiClient.get<PlatformInfo>('/api/platform/info')
  },

  // Get statistics with date range
  getStatisticsByDateRange: async (startDate: string, endDate: string): Promise<PlatformStatistics> => {
    return apiClient.get<PlatformStatistics>('/api/platform/statistics', {
      params: { startDate, endDate }
    })
  },

  // Get trending metrics
  getTrendingMetrics: async (): Promise<{
    vendorGrowth: number
    productGrowth: number
    customerGrowth: number
    orderGrowth: number
  }> => {
    return apiClient.get('/api/platform/metrics/trending')
  }
}