// Backend DTOs for Advertisement module
import { ApiResponse } from './auth.dto'

export type AdType = 'Banner' | 'Featured' | 'Sponsored' | 'PremiumSlider'
export type AdStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'
export type AdPlacement = 'Homepage' | 'Category' | 'Search' | 'Product' | 'Cart' | 'Checkout'

export interface TargetAudience {
  location?: {
    latitude: number
    longitude: number
    radius: number
  }
  ageRange?: {
    min: number
    max: number
  }
  gender?: 'Male' | 'Female' | 'All'
  interests?: string[]
  categories?: string[]
  deviceTypes?: ('Mobile' | 'Desktop' | 'Tablet')[]
  languages?: string[]
}

export interface AdPerformance {
  impressions: number
  clicks: number
  ctr: number // Click-through rate
  spent: number
  conversions: number
  conversionRate: number
  roi: number // Return on investment
  avgCpc: number // Average cost per click
  avgCpm: number // Average cost per mille (1000 impressions)
}

export interface CreativeContent {
  title: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  ctaText?: string
  ctaUrl?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}

export interface AdCampaign {
  id: string
  vendorId: string
  vendorName?: string
  name: string
  type: AdType
  placement: AdPlacement[]
  targetAudience: TargetAudience
  budget: number
  dailyBudget?: number
  bidAmount?: number
  startDate: string
  endDate: string
  status: AdStatus
  performance: AdPerformance
  creativeContent: CreativeContent
  priority: number
  isAutoRenew: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
  approvedBy?: string
}

export interface CreateAdCampaignRequest {
  name: string
  type: AdType
  placement: AdPlacement[]
  targetAudience: TargetAudience
  budget: number
  dailyBudget?: number
  bidAmount?: number
  startDate: string
  endDate: string
  creativeContent: CreativeContent
  priority?: number
  isAutoRenew?: boolean
  tags?: string[]
}

export interface UpdateAdCampaignRequest extends Partial<CreateAdCampaignRequest> {
  status?: AdStatus
}

export interface AdCampaignSearchParams {
  vendorId?: string
  type?: AdType
  status?: AdStatus
  placement?: AdPlacement
  minBudget?: number
  maxBudget?: number
  startDate?: string
  endDate?: string
  searchTerm?: string
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'budget' | 'impressions' | 'clicks' | 'ctr' | 'created' | 'status'
  sortDirection?: 'asc' | 'desc'
}

export interface AdClickEvent {
  campaignId: string
  userId?: string
  sessionId: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  device?: {
    type: 'Mobile' | 'Desktop' | 'Tablet'
    os: string
    browser: string
  }
}

export interface AdImpressionEvent {
  campaignId: string
  userId?: string
  sessionId: string
  placement: AdPlacement
  position: number
  timestamp: string
  viewDuration?: number
  isViewable: boolean
}

export interface AdAnalytics {
  campaignId: string
  period: 'hour' | 'day' | 'week' | 'month' | 'all'
  startDate: string
  endDate: string
  metrics: {
    impressions: number
    uniqueImpressions: number
    clicks: number
    uniqueClicks: number
    ctr: number
    conversions: number
    conversionRate: number
    spent: number
    revenue: number
    roi: number
  }
  demographics: {
    age: Array<{ range: string; count: number }>
    gender: Array<{ type: string; count: number }>
    location: Array<{ city: string; country: string; count: number }>
    device: Array<{ type: string; count: number }>
  }
  timeline: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    spent: number
  }>
  topPlacements: Array<{
    placement: AdPlacement
    impressions: number
    clicks: number
    ctr: number
  }>
}

export interface AdBilling {
  id: string
  campaignId: string
  vendorId: string
  amount: number
  currency: string
  type: 'Deposit' | 'Charge' | 'Refund'
  description: string
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
  paymentMethod?: string
  transactionId?: string
  createdAt: string
  processedAt?: string
}

export interface AdPackage {
  id: string
  name: string
  description: string
  type: AdType
  duration: number // days
  impressions?: number
  clicks?: number
  features: string[]
  price: number
  discountPrice?: number
  isPopular: boolean
  isActive: boolean
  limitations: {
    maxCampaigns?: number
    maxDailyBudget?: number
    placements?: AdPlacement[]
  }
}

// Response types
export interface AdCampaignListResponse extends ApiResponse<{
  campaigns: AdCampaign[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface AdCampaignResponse extends ApiResponse<AdCampaign> {}
export interface AdAnalyticsResponse extends ApiResponse<AdAnalytics> {}
export interface AdBillingListResponse extends ApiResponse<{
  transactions: AdBilling[]
  totalCount: number
  balance: number
}> {}
export interface AdPackageListResponse extends ApiResponse<AdPackage[]> {}