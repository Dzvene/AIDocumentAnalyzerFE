import { BaseEntity } from './common'
import { CartItem } from './cart'
import { Shop } from './shop'

export interface Order extends BaseEntity {
  id: string
  orderNumber: string
  userId: string
  shopId: number
  shop: Shop
  status: OrderStatus
  items: OrderItem[]
  itemCount: number
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  couponCode?: string
  paymentMethod: string
  paymentStatus: PaymentStatus
  deliveryAddress: DeliveryAddress
  deliveryInstructions?: string
  estimatedDeliveryTime: string
  actualDeliveryTime?: string
  assignedCourierId?: string
  courierInfo?: CourierInfo
  timeline: OrderTimeline[]
  cancelReason?: string
  refundAmount?: number
  rating?: number
  review?: string
}

export interface OrderItem {
  id: string
  productId: number
  productName: string
  productImage: string
  quantity: number
  price: number // price at time of order
  totalPrice: number
  notes?: string
}

export interface DeliveryAddress {
  id?: string
  fullName: string
  phone: string
  address: string
  city: string
  postalCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
  instructions?: string
  isDefault?: boolean
}

export interface CourierInfo {
  id: string
  name: string
  phone: string
  rating: number
  vehicleType: string
  vehicleNumber?: string
  photo?: string
}

export interface OrderTimeline {
  id: string
  status: OrderStatus
  timestamp: string
  description: string
  details?: string
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// API Request types
export interface CreateOrderRequest {
  cartId: string
  deliveryAddressId?: string
  deliveryAddress?: DeliveryAddress
  paymentMethod: string
  deliveryInstructions?: string
  couponCode?: string
}

export interface OrderSearchRequest {
  userId?: string
  shopId?: number
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'total' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface UpdateOrderStatusRequest {
  orderId: string
  status: OrderStatus
  notes?: string
  estimatedDeliveryTime?: string
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  todayOrders: number
  todayRevenue: number
}