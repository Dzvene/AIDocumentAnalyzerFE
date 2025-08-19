import { BaseEntity } from './common'

export interface Product extends BaseEntity {
  id: number
  name: string
  description: string
  slug: string
  price: number
  oldPrice?: number
  discount?: number
  images: string[]
  mainImage: string
  categoryId: number
  categoryName: string
  shopId: number
  shopName: string
  shopSlug: string
  rating: number
  reviewCount: number
  isAvailable: boolean
  stock: number
  unit: string // 'кг', 'шт', 'л', 'г'
  weight?: number
  volume?: number
  ingredients?: string[]
  allergens?: string[]
  nutritionFacts?: NutritionFacts
  tags: string[]
  viewCount: number
  saleCount: number
  isPromoted: boolean
  promotionEndDate?: string
}

export interface NutritionFacts {
  calories: number // per 100g/ml
  proteins: number
  fats: number
  carbohydrates: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface Category extends BaseEntity {
  id: number
  name: string
  slug: string
  description?: string
  icon: string
  parentId?: number
  level: number
  productCount: number
  isActive: boolean
  sortOrder: number
}

export interface ProductReview extends BaseEntity {
  id: number
  productId: number
  userId: string
  userName: string
  rating: number
  comment?: string
  images?: string[]
  isVerified: boolean
  likes: number
  dislikes: number
  response?: {
    text: string
    date: string
    authorName: string
  }
}

// API Request/Response types
export interface ProductSearchRequest {
  query?: string
  categoryId?: number
  shopId?: number
  minPrice?: number
  maxPrice?: number
  minRating?: number
  tags?: string[]
  inStock?: boolean
  sortBy?: 'price' | 'rating' | 'name' | 'popularity' | 'newest'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  categoryId: number
  shopId: number
  images: string[]
  stock: number
  unit: string
  weight?: number
  volume?: number
  ingredients?: string[]
  allergens?: string[]
  tags?: string[]
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isAvailable?: boolean
  oldPrice?: number
  isPromoted?: boolean
  promotionEndDate?: string
}

export interface ProductFilters {
  categories: Category[]
  priceRange: {
    min: number
    max: number
  }
  tags: string[]
  shops: Array<{
    id: number
    name: string
  }>
}

export interface CreateReviewRequest {
  productId: number
  rating: number
  comment?: string
  images?: string[]
}