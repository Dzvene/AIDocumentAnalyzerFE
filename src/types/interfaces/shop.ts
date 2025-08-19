import { BaseEntity } from './common'

export interface Shop extends BaseEntity {
  id: number
  name: string
  description: string
  slug: string
  image: string
  coverImage?: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  minOrder: number
  maxDistance: number
  phone?: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  workingHours: WorkingHours[]
  categories: string[]
  isActive: boolean
  isVerified: boolean
  ownerId: string
  paymentMethods: PaymentMethod[]
}

export interface WorkingHours {
  day: number // 0-6 (Sunday-Saturday)
  isOpen: boolean
  openTime?: string // "09:00"
  closeTime?: string // "21:00"
}

export interface PaymentMethod {
  id: string
  name: string
  icon?: string
  isActive: boolean
}

export interface ShopStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  completionRate: number
  averageDeliveryTime: number
}

// API Request/Response types
export interface CreateShopRequest {
  name: string
  description: string
  phone: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  workingHours: WorkingHours[]
  categoryIds: number[]
}

export interface UpdateShopRequest extends Partial<CreateShopRequest> {
  isActive?: boolean
}

export interface ShopSearchRequest {
  query?: string
  categoryId?: number
  lat?: number
  lng?: number
  radius?: number
  minRating?: number
  sortBy?: 'distance' | 'rating' | 'deliveryTime' | 'name'
  sortOrder?: 'asc' | 'desc'
}