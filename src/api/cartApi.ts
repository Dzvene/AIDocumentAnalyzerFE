import { apiClient } from './config'
import { 
  Cart, 
  CartItem, 
  CartSummary,
  AddToCartRequest, 
  UpdateCartItemRequest,
  ApplyCouponRequest,
  Coupon 
} from '@types/interfaces/cart'

export const cartApi = {
  // Get cart
  getCart: async (cartId?: string): Promise<Cart> => {
    const url = cartId ? `/cart/${cartId}` : '/cart'
    return apiClient.get<Cart>(url)
  },

  // Get cart for guest users (by session)
  getGuestCart: async (sessionId: string): Promise<Cart> => {
    return apiClient.get<Cart>(`/cart/guest/${sessionId}`)
  },

  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    return apiClient.post<Cart>('/cart/items', data)
  },

  // Update cart item
  updateCartItem: async (data: UpdateCartItemRequest): Promise<Cart> => {
    return apiClient.patch<Cart>(`/cart/items/${data.itemId}`, data)
  },

  // Remove item from cart
  removeCartItem: async (itemId: string): Promise<Cart> => {
    return apiClient.delete<Cart>(`/cart/items/${itemId}`)
  },

  // Clear entire cart
  clearCart: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/cart')
  },

  // Get cart summary (lightweight response)
  getCartSummary: async (): Promise<CartSummary> => {
    return apiClient.get<CartSummary>('/cart/summary')
  },

  // Apply coupon
  applyCoupon: async (data: ApplyCouponRequest): Promise<Cart> => {
    return apiClient.post<Cart>('/cart/coupon', data)
  },

  // Remove coupon
  removeCoupon: async (): Promise<Cart> => {
    return apiClient.delete<Cart>('/cart/coupon')
  },

  // Validate coupon
  validateCoupon: async (couponCode: string): Promise<Coupon> => {
    return apiClient.get<Coupon>(`/coupons/validate/${couponCode}`)
  },

  // Merge guest cart with user cart (called after login)
  mergeCart: async (guestCartId: string): Promise<Cart> => {
    return apiClient.post<Cart>('/cart/merge', { guestCartId })
  },

  // Get available coupons for user
  getAvailableCoupons: async (): Promise<Coupon[]> => {
    return apiClient.get<Coupon[]>('/coupons/available')
  },

  // Calculate delivery fee
  calculateDeliveryFee: async (addressId?: string, coordinates?: { lat: number; lng: number }): Promise<{ deliveryFee: number; estimatedTime: string }> => {
    const params = addressId ? { addressId } : coordinates
    return apiClient.get<{ deliveryFee: number; estimatedTime: string }>('/cart/delivery-fee', { params })
  }
}