import { apiClient } from './config'
import {
  OrderDto,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  OrderListRequest,
  OrderListResponse,
  OrderResponse,
  OrderSummaryResponse,
  OrderStatisticsResponse,
  OrderInvoiceResponse,
  RefundRequest,
  RefundResponse,
  BulkOrderUpdateRequest,
  OrderExportRequest,
  OrderStatus,
  PaymentStatus,
  ApiResponse
} from '@types/dto/order.dto'

export const ordersApi = {
  // Core order endpoints
  getOrders: async (params?: OrderListRequest): Promise<OrderListResponse> => {
    return apiClient.get<OrderListResponse>('/api/orders', { params })
  },

  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>('/api/orders', data)
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return apiClient.get<OrderResponse>(`/api/orders/${id}`)
  },

  updateOrder: async (id: string, data: UpdateOrderRequest): Promise<OrderResponse> => {
    return apiClient.put<OrderResponse>(`/api/orders/${id}`, data)
  },

  cancelOrder: async (id: string, data: CancelOrderRequest): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${id}/cancel`, data)
  },

  // My orders (customer)
  getMyOrders: async (params?: OrderListRequest): Promise<OrderListResponse> => {
    return apiClient.get<OrderListResponse>('/api/orders/my-orders', { params })
  },

  // Vendor orders
  getVendorOrders: async (vendorId: string, params?: OrderListRequest): Promise<OrderListResponse> => {
    return apiClient.get<OrderListResponse>(`/api/orders/vendor/${vendorId}`, { params })
  },

  // Order status management
  updateOrderStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${id}/status`, data)
  },

  confirmOrder: async (id: string): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${id}/confirm`)
  },

  markAsShipped: async (id: string, trackingNumber?: string, provider?: string): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${id}/ship`, { 
      trackingNumber, 
      deliveryProvider: provider 
    })
  },

  markAsDelivered: async (id: string, notes?: string): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${id}/deliver`, { notes })
  },

  // Payment status
  updatePaymentStatus: async (id: string, status: PaymentStatus, transactionId?: string): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${id}/payment-status`, { 
      status, 
      transactionId 
    })
  },

  // Refunds
  requestRefund: async (id: string, data: RefundRequest): Promise<RefundResponse> => {
    return apiClient.post<RefundResponse>(`/api/orders/${id}/refund`, data)
  },

  processRefund: async (id: string, data: RefundRequest): Promise<RefundResponse> => {
    return apiClient.post<RefundResponse>(`/api/orders/${id}/process-refund`, data)
  },

  // Order tracking
  getTrackingInfo: async (id: string): Promise<ApiResponse<{
    trackingNumber?: string
    provider?: string
    trackingUrl?: string
    status: string
    events: Array<{
      status: string
      location?: string
      timestamp: string
      description: string
    }>
  }>> => {
    return apiClient.get<ApiResponse<any>>(`/api/orders/${id}/tracking`)
  },

  // Order summary and analytics
  getOrderSummary: async (params?: {
    vendorId?: string
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<OrderSummaryResponse> => {
    return apiClient.get<OrderSummaryResponse>('/api/orders/summary', { params })
  },

  getOrderStatistics: async (params?: {
    vendorId?: string
    startDate?: string
    endDate?: string
  }): Promise<OrderStatisticsResponse> => {
    return apiClient.get<OrderStatisticsResponse>('/api/orders/statistics', { params })
  },

  // Invoice
  getOrderInvoice: async (id: string): Promise<OrderInvoiceResponse> => {
    return apiClient.get<OrderInvoiceResponse>(`/api/orders/${id}/invoice`)
  },

  downloadInvoice: async (id: string, format: 'pdf' | 'html' = 'pdf'): Promise<Blob> => {
    return apiClient.get<Blob>(`/api/orders/${id}/invoice/download`, {
      params: { format },
      responseType: 'blob'
    })
  },

  // Bulk operations
  bulkUpdateOrders: async (data: BulkOrderUpdateRequest): Promise<ApiResponse<{
    updated: OrderDto[]
    failed: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.post<ApiResponse<{
      updated: OrderDto[]
      failed: Array<{ id: string; error: string }>
    }>>('/api/orders/bulk-update', data)
  },

  // Export
  exportOrders: async (params: OrderExportRequest): Promise<Blob> => {
    return apiClient.get<Blob>('/api/orders/export', {
      params,
      responseType: 'blob'
    })
  },

  // Order notes
  addOrderNote: async (id: string, note: string, isInternal: boolean = false): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>(`/api/orders/${id}/notes`, { note, isInternal })
  },

  // Reorder
  reorder: async (orderId: string): Promise<OrderResponse> => {
    return apiClient.post<OrderResponse>(`/api/orders/${orderId}/reorder`)
  },

  // Order validation
  validateOrder: async (data: CreateOrderRequest): Promise<ApiResponse<{
    isValid: boolean
    errors?: string[]
    warnings?: string[]
    estimatedTotal?: number
    estimatedDelivery?: string
  }>> => {
    return apiClient.post<ApiResponse<any>>('/api/orders/validate', data)
  }
}