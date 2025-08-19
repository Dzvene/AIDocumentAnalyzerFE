import axios from 'axios'
import { CartItem, ShopCart, ShopBasicInfo } from '@store/slices/multiCartSlice'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

export interface GetAllCartsResponse {
  carts: {
    [shopId: string]: ShopCart
  }
  totalCount: number
  totalAmount: number
  hasValidCarts: boolean
  hasInvalidCarts: boolean
}

export interface AddToCartRequest {
  productId: string
  quantity: number
  notes?: string
}

export interface AddToCartResponse {
  cart: ShopCart
  addedItem: CartItem
  message?: string
}

export interface UpdateCartItemRequest {
  quantity: number
  notes?: string
}

export interface CartValidationResponse {
  isValid: boolean
  errors: string[]
  warnings: string[]
  minOrderAmount: number
  currentAmount: number
  missingAmount?: number
}

export interface CartSummaryResponse {
  shopId: string
  shopName: string
  itemsCount: number
  uniqueItemsCount: number
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  estimatedPreparationTime: string
  weight?: number
}

export interface MergeCartsRequest {
  sourceShopIds: string[]
  targetShopId: string
  strategy: 'combine' | 'replace' | 'keep_highest_quantity'
}

export interface MergeCartsResponse {
  mergedCart: ShopCart
  removedCarts: string[]
  conflictResolution: {
    productId: string
    action: string
    finalQuantity: number
  }[]
}

export interface CheckoutCartRequest {
  shopId: string
  deliveryType: string
  deliveryAddressId?: string
  pickupPointId?: string
  timeSlotId?: string
  paymentMethodId: string
  notes?: string
  promoCode?: string
}

export interface CheckoutCartResponse {
  orderId: string
  orderNumber: string
  totalAmount: number
  estimatedDeliveryTime: string
  paymentUrl?: string
  trackingUrl?: string
}

export interface CartRecommendationsResponse {
  recommendations: {
    productId: string
    productName: string
    reason: 'frequently_bought' | 'similar' | 'complementary' | 'on_sale'
    discount?: number
    price: number
  }[]
}

export interface CartPriceUpdateResponse {
  updatedItems: {
    productId: string
    oldPrice: number
    newPrice: number
    reason: string
  }[]
  oldTotal: number
  newTotal: number
  requiresConfirmation: boolean
}

export interface SyncCartsRequest {
  localCarts: {
    [shopId: string]: ShopCart
  }
  lastSyncTime?: number
}

export interface SyncCartsResponse {
  syncedCarts: {
    [shopId: string]: ShopCart
  }
  conflicts: {
    shopId: string
    type: 'price_change' | 'out_of_stock' | 'shop_closed' | 'min_order_changed'
    resolution: string
  }[]
  syncTime: number
}

class MultiCartApi {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async getAllCarts(): Promise<GetAllCartsResponse> {
    const { data } = await this.axiosInstance.get('/carts/all')
    return data
  }

  async getShopCart(shopId: string): Promise<ShopCart | null> {
    try {
      const { data } = await this.axiosInstance.get(`/carts/${shopId}`)
      return data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async createCart(shopId: string, shopInfo: ShopBasicInfo): Promise<ShopCart> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/create`, { shopInfo })
    return data
  }

  async addToCart(shopId: string, request: AddToCartRequest): Promise<AddToCartResponse> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/items`, request)
    return data
  }

  async updateCartItem(
    shopId: string,
    itemId: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    const { data } = await this.axiosInstance.patch(`/carts/${shopId}/items/${itemId}`, request)
    return data
  }

  async removeFromCart(shopId: string, itemId: string): Promise<void> {
    await this.axiosInstance.delete(`/carts/${shopId}/items/${itemId}`)
  }

  async clearCart(shopId: string): Promise<void> {
    await this.axiosInstance.delete(`/carts/${shopId}`)
  }

  async clearAllCarts(): Promise<void> {
    await this.axiosInstance.delete('/carts/all')
  }

  async validateCart(shopId: string): Promise<CartValidationResponse> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/validate`)
    return data
  }

  async getCartSummary(shopId: string): Promise<CartSummaryResponse> {
    const { data } = await this.axiosInstance.get(`/carts/${shopId}/summary`)
    return data
  }

  async applyPromoCode(shopId: string, promoCode: string): Promise<{
    applied: boolean
    discount: number
    message: string
    newTotal: number
  }> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/promo`, { promoCode })
    return data
  }

  async removePromoCode(shopId: string): Promise<void> {
    await this.axiosInstance.delete(`/carts/${shopId}/promo`)
  }

  async mergeCarts(request: MergeCartsRequest): Promise<MergeCartsResponse> {
    const { data } = await this.axiosInstance.post('/carts/merge', request)
    return data
  }

  async duplicateCart(shopId: string): Promise<ShopCart> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/duplicate`)
    return data
  }

  async saveCartForLater(shopId: string, name?: string): Promise<{
    savedCartId: string
    expiresAt: string
  }> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/save-for-later`, { name })
    return data
  }

  async getSavedCarts(): Promise<{
    savedCarts: {
      id: string
      name?: string
      shopId: string
      shopName: string
      itemsCount: number
      total: number
      savedAt: string
      expiresAt: string
    }[]
  }> {
    const { data } = await this.axiosInstance.get('/carts/saved')
    return data
  }

  async restoreSavedCart(savedCartId: string): Promise<ShopCart> {
    const { data } = await this.axiosInstance.post(`/carts/saved/${savedCartId}/restore`)
    return data
  }

  async checkoutCart(request: CheckoutCartRequest): Promise<CheckoutCartResponse> {
    const { data } = await this.axiosInstance.post(`/carts/${request.shopId}/checkout`, request)
    return data
  }

  async checkoutMultipleCarts(
    cartIds: string[],
    commonDeliveryAddressId: string
  ): Promise<{
    orders: CheckoutCartResponse[]
    totalAmount: number
    failedCarts: {
      shopId: string
      reason: string
    }[]
  }> {
    const { data } = await this.axiosInstance.post('/carts/checkout-multiple', {
      cartIds,
      commonDeliveryAddressId
    })
    return data
  }

  async getCartRecommendations(shopId: string): Promise<CartRecommendationsResponse> {
    const { data } = await this.axiosInstance.get(`/carts/${shopId}/recommendations`)
    return data
  }

  async checkPriceUpdates(shopId: string): Promise<CartPriceUpdateResponse> {
    const { data } = await this.axiosInstance.get(`/carts/${shopId}/check-prices`)
    return data
  }

  async acceptPriceUpdates(shopId: string): Promise<ShopCart> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/accept-price-updates`)
    return data
  }

  async syncCarts(request: SyncCartsRequest): Promise<SyncCartsResponse> {
    const { data } = await this.axiosInstance.post('/carts/sync', request)
    return data
  }

  async shareCart(shopId: string): Promise<{
    shareUrl: string
    shareCode: string
    expiresAt: string
  }> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/share`)
    return data
  }

  async importSharedCart(shareCode: string): Promise<ShopCart> {
    const { data } = await this.axiosInstance.post('/carts/import-shared', { shareCode })
    return data
  }

  async estimateCartTotals(
    shopId: string,
    deliveryAddressId: string,
    deliveryType: string
  ): Promise<{
    subtotal: number
    deliveryFee: number
    taxes: number
    serviceFee: number
    discount: number
    total: number
    breakdown: {
      item: string
      amount: number
    }[]
  }> {
    const { data } = await this.axiosInstance.post(`/carts/${shopId}/estimate`, {
      deliveryAddressId,
      deliveryType
    })
    return data
  }

  async getCartHistory(
    page = 1,
    limit = 10
  ): Promise<{
    history: {
      cartId: string
      shopName: string
      createdAt: string
      checkoutAt?: string
      status: 'active' | 'checked_out' | 'abandoned' | 'saved'
      itemsCount: number
      total: number
    }[]
    total: number
    page: number
    totalPages: number
  }> {
    const { data } = await this.axiosInstance.get('/carts/history', {
      params: { page, limit }
    })
    return data
  }
}

export const multiCartApi = new MultiCartApi()