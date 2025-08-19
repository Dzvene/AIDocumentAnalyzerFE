import { BaseEntity } from './common'
import { Product } from './product'

export interface CartItem {
  id: string
  productId: number
  product: Product
  quantity: number
  price: number // price at the time of adding to cart
  totalPrice: number
  notes?: string
  selectedOptions?: ProductOption[]
}

export interface ProductOption {
  id: string
  name: string
  value: string
  priceModifier: number // additional cost
}

export interface Cart {
  id: string
  userId?: string // null for guest carts
  sessionId?: string // for guest carts
  items: CartItem[]
  itemCount: number
  subtotal: number
  deliveryFee: number
  total: number
  couponCode?: string
  coupon?: Coupon
  discount: number
  shopId?: number // if cart contains items from single shop
  estimatedDeliveryTime?: string
  updatedAt: string
}

export interface CartSummary {
  itemCount: number
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
}

// API Request types
export interface AddToCartRequest {
  productId: number
  quantity: number
  notes?: string
  selectedOptions?: ProductOption[]
}

export interface UpdateCartItemRequest {
  itemId: string
  quantity: number
  notes?: string
  selectedOptions?: ProductOption[]
}

export interface ApplyCouponRequest {
  couponCode: string
}

export interface Coupon extends BaseEntity {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed' | 'free_delivery'
  value: number // percentage or fixed amount
  minOrderAmount?: number
  maxDiscount?: number
  shopId?: number // null for global coupons
  usageLimit?: number
  usedCount: number
  startDate: string
  endDate: string
  isActive: boolean
}