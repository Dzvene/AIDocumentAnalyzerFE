// Backend DTOs for Product module
import { ApiResponse } from './auth.dto'

export interface ProductDto {
  id: string
  name: string
  description: string
  sku: string
  barcode: string
  price: number
  compareAtPrice?: number
  cost: number
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  unit: string
  weight?: number
  weightUnit?: string
  trackInventory: boolean
  allowBackorder: boolean
  lowStockThreshold?: number
  isActive: boolean
  isFeatured: boolean
  categoryId: string
  categoryName: string
  vendorId: string
  vendorName: string
  images: string[]
  tags: string[]
  attributes: Record<string, any>
  viewCount: number
  orderCount: number
  rating?: number
  reviewCount: number
  createdAt: string
  updatedAt?: string
}

export interface CreateProductRequest {
  name: string
  description: string
  sku: string
  barcode?: string
  price: number
  compareAtPrice?: number
  cost: number
  stockQuantity: number
  unit: string
  weight?: number
  weightUnit?: string
  trackInventory: boolean
  allowBackorder: boolean
  lowStockThreshold?: number
  isActive: boolean
  isFeatured: boolean
  categoryId: string
  images: string[]
  tags: string[]
  attributes?: Record<string, any>
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductListRequest {
  vendorId?: string
  categoryId?: string
  searchTerm?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isActive?: boolean
  isFeatured?: boolean
  tags?: string[]
  sortBy?: 'name' | 'price' | 'created' | 'rating' | 'popularity'
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface ProductInventoryUpdate {
  productId: string
  quantity: number
  type: 'add' | 'subtract' | 'set'
  reason?: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  price: number
  stockQuantity: number
  attributes: Record<string, any>
  images?: string[]
  isActive: boolean
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  orderId?: string
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerified: boolean
  helpfulCount: number
  createdAt: string
  updatedAt?: string
  vendorResponse?: {
    text: string
    createdAt: string
  }
}

// Response types
export interface ProductListResponse extends ApiResponse<{
  products: ProductDto[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface ProductResponse extends ApiResponse<ProductDto> {}

export interface ProductReviewsResponse extends ApiResponse<{
  reviews: ProductReview[]
  totalCount: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}> {}