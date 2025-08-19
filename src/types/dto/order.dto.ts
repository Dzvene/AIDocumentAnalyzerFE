// Backend DTOs for Orders module
import { ApiResponse } from './auth.dto'

export interface OrderDto {
  id: string
  orderNumber: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  vendorId: string
  vendorName: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  paymentTransactionId?: string
  items: OrderItemDto[]
  subtotal: number
  shippingFee: number
  taxAmount: number
  discountAmount: number
  total: number
  couponCode?: string
  shippingAddress?: ShippingAddressDto
  billingAddress?: BillingAddressDto
  notes?: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  cancellationReason?: string
  trackingNumber?: string
  deliveryProvider?: string
  deliveryDetails?: DeliveryDetailsDto
  statusHistory: OrderStatusHistoryDto[]
}

export interface OrderItemDto {
  id: string
  productId: string
  productName: string
  productSKU: string
  productImage?: string
  quantity: number
  unitPrice: number
  originalPrice: number
  discount: number
  subtotal: number
  notes?: string
  attributes: Record<string, any>
}

export interface OrderStatusHistoryDto {
  id: string
  status: string
  notes?: string
  changedBy: string
  changedAt: string
}

export interface ShippingAddressDto {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  instructions?: string
}

export interface BillingAddressDto {
  fullName: string
  companyName?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  taxId?: string
}

export interface DeliveryDetailsDto {
  type: 'Standard' | 'Express' | 'SameDay' | 'Pickup' | 'Marketplace'
  provider: string
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
  trackingUrl?: string
  courierName?: string
  courierPhone?: string
  deliveryNotes?: string
  statusUpdates?: DeliveryStatusUpdateDto[]
}

export interface DeliveryStatusUpdateDto {
  timestamp: string
  status: string
  location: string
  notes?: string
}

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded'
  | 'Failed'

export type PaymentStatus = 
  | 'Pending'
  | 'Processing'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled'

export interface CreateOrderRequest {
  vendorId: string
  items: OrderItemRequest[]
  shippingAddress: ShippingAddressDto
  billingAddress?: BillingAddressDto
  paymentMethod: string
  couponCode?: string
  notes?: string
  deliveryType?: string
}

export interface OrderItemRequest {
  productId: string
  quantity: number
  notes?: string
  attributes?: Record<string, any>
}

export interface UpdateOrderStatusRequest {
  status: string
  notes?: string
  trackingNumber?: string
  deliveryProvider?: string
}

export interface CancelOrderRequest {
  reason: string
  notes?: string
  refundPayment?: boolean
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  shippingAddress?: ShippingAddressDto
  billingAddress?: BillingAddressDto
  notes?: string
  internalNotes?: string
  trackingNumber?: string
  deliveryProvider?: string
}

export interface OrderListRequest {
  userId?: string
  vendorId?: string
  status?: string
  paymentStatus?: string
  orderNumber?: string
  searchTerm?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortDescending?: boolean
  page?: number
  pageSize?: number
}

export interface OrderStatistics {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<string, number>
  revenueByMonth: Record<string, number>
  topProducts: TopProductDto[]
}

export interface TopProductDto {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

export interface OrderSummary {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  statusBreakdown: {
    [K in OrderStatus]?: number
  }
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  recentOrders: OrderDto[]
}

export interface OrderInvoiceDto {
  orderId: string
  invoiceNumber: string
  invoiceDate: string
  order: OrderDto
  vendorTaxId: string
  vendorAddress: string
  customerTaxId?: string
  taxRate: number
  paymentTerms?: string
  notes?: string
}

export interface RefundRequest {
  amount: number
  reason: string
  items?: RefundItemRequest[]
  notes?: string
}

export interface RefundItemRequest {
  orderItemId: string
  quantity: number
  amount: number
}

export interface RefundDto {
  id: string
  orderId: string
  refundNumber: string
  amount: number
  status: string
  reason: string
  notes?: string
  paymentRefundId?: string
  createdAt: string
  processedAt?: string
  items: RefundItemDto[]
}

export interface RefundItemDto {
  orderItemId: string
  productName: string
  quantity: number
  amount: number
}

export interface BulkOrderUpdateRequest {
  orderIds: string[]
  action: string
  parameters: Record<string, any>
}

export interface OrderExportRequest {
  startDate?: string
  endDate?: string
  status?: string
  vendorId?: string
  format?: 'csv' | 'excel' | 'pdf'
  fields?: string[]
}

// Response types
export interface OrderListResponse extends ApiResponse<{
  orders: OrderDto[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface OrderResponse extends ApiResponse<OrderDto> {}
export interface OrderSummaryResponse extends ApiResponse<OrderSummary> {}
export interface OrderStatisticsResponse extends ApiResponse<OrderStatistics> {}
export interface OrderInvoiceResponse extends ApiResponse<OrderInvoiceDto> {}
export interface RefundResponse extends ApiResponse<RefundDto> {}