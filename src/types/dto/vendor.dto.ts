// Backend DTOs for Vendor module
import { ApiResponse } from './auth.dto'

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
}

export interface BusinessHours {
  [day: string]: {
    open: string
    close: string
    isClosed: boolean
  }
}

export interface DeliveryOptions {
  ownDelivery: boolean
  thirdPartyDelivery: boolean
  courierDelivery: boolean
  selfPickup: boolean
  marketplaceDelivery: boolean
}

export interface VendorDto {
  id: string
  userId: string
  businessName: string
  description: string
  email: string
  phoneNumber: string
  website?: string
  logoUrl?: string
  bannerUrl?: string
  address: Address
  businessHours: BusinessHours
  isVerified: boolean
  verificationDate?: string
  rating: number
  totalReviews: number
  totalProducts: number
  commission: number
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending'
  createdAt: string
  updatedAt: string
  
  // Geolocation fields for marketplace model
  deliveryRadius: number
  deliveryOptions: DeliveryOptions
  minOrderAmount: number
  averageDeliveryTime: string
  deliveryFee: number
  
  // Premium features
  isPremium: boolean
  premiumExpiryDate?: string
  subscriptionTier?: 'Basic' | 'Professional' | 'Enterprise'
  
  // Analytics
  totalOrders?: number
  totalRevenue?: number
  averageOrderValue?: number
  conversionRate?: number
}

export interface CreateVendorRequest {
  businessName: string
  description: string
  email: string
  phoneNumber: string
  website?: string
  address: Address
  businessHours: BusinessHours
  deliveryRadius: number
  deliveryOptions: DeliveryOptions
  minOrderAmount: number
  averageDeliveryTime: string
  deliveryFee: number
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  logoUrl?: string
  bannerUrl?: string
}

export interface VendorSearchParams {
  latitude?: number
  longitude?: number
  radius?: number
  category?: string
  isVerified?: boolean
  isPremium?: boolean
  minRating?: number
  deliveryType?: keyof DeliveryOptions
  searchTerm?: string
  page?: number
  pageSize?: number
  sortBy?: 'rating' | 'distance' | 'deliveryTime' | 'popularity'
  sortDirection?: 'asc' | 'desc'
}

export interface VendorStatistics {
  vendorId: string
  period: 'day' | 'week' | 'month' | 'year' | 'all'
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalCustomers: number
  repeatCustomers: number
  topProducts: Array<{
    productId: string
    productName: string
    sales: number
    revenue: number
  }>
  peakHours: Array<{
    hour: number
    orders: number
  }>
  customerSatisfaction: number
  deliveryPerformance: {
    onTime: number
    late: number
    averageTime: string
  }
}

export interface VendorReview {
  id: string
  vendorId: string
  customerId: string
  customerName: string
  customerAvatar?: string
  orderId: string
  rating: number
  comment: string
  images?: string[]
  createdAt: string
  updatedAt: string
  isVerified: boolean
  helpfulCount: number
  response?: {
    text: string
    createdAt: string
  }
}

export interface VendorSubscription {
  id: string
  vendorId: string
  tier: 'Basic' | 'Professional' | 'Enterprise'
  status: 'Active' | 'Cancelled' | 'Expired' | 'Trial'
  startDate: string
  endDate: string
  autoRenew: boolean
  features: string[]
  price: number
  billingCycle: 'monthly' | 'yearly'
  paymentMethod?: string
  nextBillingDate?: string
}

// Response types
export interface VendorListResponse extends ApiResponse<{
  vendors: VendorDto[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface VendorResponse extends ApiResponse<VendorDto> {}
export interface VendorStatisticsResponse extends ApiResponse<VendorStatistics> {}
export interface VendorReviewsResponse extends ApiResponse<{
  reviews: VendorReview[]
  totalCount: number
  averageRating: number
}> {}
export interface VendorSubscriptionResponse extends ApiResponse<VendorSubscription> {}