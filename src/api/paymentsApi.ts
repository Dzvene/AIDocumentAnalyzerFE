import { apiClient } from './config'
import { PaginatedResponse } from '@types/interfaces/common'

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash_on_delivery' | 'apple_pay' | 'google_pay'
  name: string
  details: {
    cardNumber?: string
    expiryDate?: string
    holderName?: string
    cvv?: string
    brand?: string
    last4?: string
    email?: string
    accountNumber?: string
    routingNumber?: string
    bankName?: string
    walletAddress?: string
    cryptoType?: string
  }
  isDefault: boolean
  isActive: boolean
  isVerified: boolean
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface PaymentTransaction {
  id: string
  orderId: string
  paymentMethodId?: string
  amount: number
  currency: string
  method: PaymentMethod['type']
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded'
  gatewayTransactionId?: string
  gatewayResponse?: any
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  fees?: {
    gatewayFee: number
    processingFee: number
    totalFees: number
  }
  createdAt: string
  updatedAt: string
  completedAt?: string
  refundedAt?: string
}

interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  paymentMethods: string[]
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled'
  metadata?: Record<string, any>
  expiresAt: string
}

interface CreatePaymentMethodRequest {
  type: PaymentMethod['type']
  details: PaymentMethod['details']
  isDefault?: boolean
  billingAddress?: {
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

interface UpdatePaymentMethodRequest {
  name?: string
  details?: Partial<PaymentMethod['details']>
  isDefault?: boolean
  billingAddress?: {
    firstName?: string
    lastName?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

interface ProcessPaymentRequest {
  orderId: string
  paymentMethodId?: string
  amount: number
  currency: string
  paymentMethod?: {
    type: PaymentMethod['type']
    details: PaymentMethod['details']
  }
  billingAddress?: {
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  savePaymentMethod?: boolean
  returnUrl?: string
  metadata?: Record<string, any>
}

interface RefundRequest {
  amount?: number
  reason: string
  metadata?: Record<string, any>
}

interface PaymentGatewayConfig {
  gateway: 'stripe' | 'paypal' | 'square' | 'razorpay'
  publicKey?: string
  clientId?: string
  environment: 'sandbox' | 'production'
  supportedMethods: PaymentMethod['type'][]
  isActive: boolean
  settings: Record<string, any>
}

export const paymentsApi = {
  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return apiClient.get<PaymentMethod[]>('/payments/methods')
  },

  getPaymentMethodById: async (id: string): Promise<PaymentMethod> => {
    return apiClient.get<PaymentMethod>(`/payments/methods/${id}`)
  },

  getDefaultPaymentMethod: async (): Promise<PaymentMethod | null> => {
    return apiClient.get<PaymentMethod | null>('/payments/methods/default')
  },

  createPaymentMethod: async (data: CreatePaymentMethodRequest): Promise<PaymentMethod> => {
    return apiClient.post<PaymentMethod>('/payments/methods', data)
  },

  updatePaymentMethod: async (id: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> => {
    return apiClient.patch<PaymentMethod>(`/payments/methods/${id}`, data)
  },

  deletePaymentMethod: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/payments/methods/${id}`)
  },

  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    return apiClient.patch<PaymentMethod>(`/payments/methods/${id}/default`)
  },

  verifyPaymentMethod: async (id: string, verificationData?: any): Promise<PaymentMethod> => {
    return apiClient.post<PaymentMethod>(`/payments/methods/${id}/verify`, verificationData)
  },

  // Payment Processing
  createPaymentIntent: async (data: {
    amount: number
    currency: string
    orderId?: string
    paymentMethods?: PaymentMethod['type'][]
    metadata?: Record<string, any>
  }): Promise<PaymentIntent> => {
    return apiClient.post<PaymentIntent>('/payments/intents', data)
  },

  getPaymentIntent: async (id: string): Promise<PaymentIntent> => {
    return apiClient.get<PaymentIntent>(`/payments/intents/${id}`)
  },

  confirmPaymentIntent: async (id: string, data: {
    paymentMethodId?: string
    returnUrl?: string
  }): Promise<PaymentIntent> => {
    return apiClient.post<PaymentIntent>(`/payments/intents/${id}/confirm`, data)
  },

  cancelPaymentIntent: async (id: string, reason?: string): Promise<PaymentIntent> => {
    return apiClient.post<PaymentIntent>(`/payments/intents/${id}/cancel`, { reason })
  },

  processPayment: async (data: ProcessPaymentRequest): Promise<{
    transaction: PaymentTransaction
    requiresAction?: boolean
    actionData?: any
    redirectUrl?: string
  }> => {
    return apiClient.post<{
      transaction: PaymentTransaction
      requiresAction?: boolean
      actionData?: any
      redirectUrl?: string
    }>('/payments/process', data)
  },

  // Transactions
  getTransactions: async (params?: {
    orderId?: string
    status?: PaymentTransaction['status']
    method?: PaymentMethod['type']
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<PaymentTransaction>> => {
    return apiClient.get<PaginatedResponse<PaymentTransaction>>('/payments/transactions', { params })
  },

  getTransactionById: async (id: string): Promise<PaymentTransaction> => {
    return apiClient.get<PaymentTransaction>(`/payments/transactions/${id}`)
  },

  getOrderTransactions: async (orderId: string): Promise<PaymentTransaction[]> => {
    return apiClient.get<PaymentTransaction[]>(`/orders/${orderId}/transactions`)
  },

  // Refunds
  createRefund: async (transactionId: string, data: RefundRequest): Promise<PaymentTransaction> => {
    return apiClient.post<PaymentTransaction>(`/payments/transactions/${transactionId}/refund`, data)
  },

  getRefunds: async (transactionId: string): Promise<PaymentTransaction[]> => {
    return apiClient.get<PaymentTransaction[]>(`/payments/transactions/${transactionId}/refunds`)
  },

  // Payment Gateway Configuration
  getGatewayConfigs: async (): Promise<PaymentGatewayConfig[]> => {
    return apiClient.get<PaymentGatewayConfig[]>('/payments/gateways')
  },

  getGatewayConfig: async (gateway: string): Promise<PaymentGatewayConfig> => {
    return apiClient.get<PaymentGatewayConfig>(`/payments/gateways/${gateway}`)
  },

  updateGatewayConfig: async (gateway: string, config: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig> => {
    return apiClient.patch<PaymentGatewayConfig>(`/payments/gateways/${gateway}`, config)
  },

  testGatewayConnection: async (gateway: string): Promise<{
    success: boolean
    message: string
    details?: any
  }> => {
    return apiClient.post<{
      success: boolean
      message: string
      details?: any
    }>(`/payments/gateways/${gateway}/test`)
  },

  // Supported Payment Methods
  getSupportedMethods: async (): Promise<Array<{
    type: PaymentMethod['type']
    name: string
    icon?: string
    description?: string
    isAvailable: boolean
    fees?: {
      percentage?: number
      fixed?: number
      minimum?: number
      maximum?: number
    }
  }>> => {
    return apiClient.get<Array<{
      type: PaymentMethod['type']
      name: string
      icon?: string
      description?: string
      isAvailable: boolean
      fees?: {
        percentage?: number
        fixed?: number
        minimum?: number
        maximum?: number
      }
    }>>('/payments/supported-methods')
  },

  checkMethodAvailability: async (params: {
    type: PaymentMethod['type']
    amount: number
    currency: string
    country?: string
  }): Promise<{
    isAvailable: boolean
    reason?: string
    alternatives?: PaymentMethod['type'][]
  }> => {
    return apiClient.post<{
      isAvailable: boolean
      reason?: string
      alternatives?: PaymentMethod['type'][]
    }>('/payments/check-availability', params)
  },

  // Payment Validation
  validateCard: async (cardData: {
    number: string
    expiryMonth: string
    expiryYear: string
    cvv: string
  }): Promise<{
    isValid: boolean
    brand?: string
    errors?: string[]
  }> => {
    return apiClient.post<{
      isValid: boolean
      brand?: string
      errors?: string[]
    }>('/payments/validate-card', cardData)
  },

  validateBankAccount: async (accountData: {
    accountNumber: string
    routingNumber: string
    accountType: 'checking' | 'savings'
  }): Promise<{
    isValid: boolean
    bankName?: string
    errors?: string[]
  }> => {
    return apiClient.post<{
      isValid: boolean
      bankName?: string
      errors?: string[]
    }>('/payments/validate-bank-account', accountData)
  },

  // Payment Statistics
  getPaymentStats: async (params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<{
    totalAmount: number
    totalTransactions: number
    successfulTransactions: number
    failedTransactions: number
    refundedAmount: number
    averageTransactionValue: number
    methodBreakdown: Array<{
      method: PaymentMethod['type']
      count: number
      amount: number
      percentage: number
    }>
    statusBreakdown: Array<{
      status: PaymentTransaction['status']
      count: number
      percentage: number
    }>
    timeline: Array<{
      date: string
      amount: number
      transactions: number
      successRate: number
    }>
  }> => {
    return apiClient.get<{
      totalAmount: number
      totalTransactions: number
      successfulTransactions: number
      failedTransactions: number
      refundedAmount: number
      averageTransactionValue: number
      methodBreakdown: Array<{
        method: PaymentMethod['type']
        count: number
        amount: number
        percentage: number
      }>
      statusBreakdown: Array<{
        status: PaymentTransaction['status']
        count: number
        percentage: number
      }>
      timeline: Array<{
        date: string
        amount: number
        transactions: number
        successRate: number
      }>
    }>('/payments/stats', { params })
  },

  // Webhooks
  getWebhooks: async (): Promise<Array<{
    id: string
    url: string
    events: string[]
    isActive: boolean
    secret: string
    createdAt: string
  }>> => {
    return apiClient.get<Array<{
      id: string
      url: string
      events: string[]
      isActive: boolean
      secret: string
      createdAt: string
    }>>('/payments/webhooks')
  },

  createWebhook: async (data: {
    url: string
    events: string[]
    isActive?: boolean
  }): Promise<{
    id: string
    url: string
    events: string[]
    isActive: boolean
    secret: string
    createdAt: string
  }> => {
    return apiClient.post<{
      id: string
      url: string
      events: string[]
      isActive: boolean
      secret: string
      createdAt: string
    }>('/payments/webhooks', data)
  },

  updateWebhook: async (id: string, data: {
    url?: string
    events?: string[]
    isActive?: boolean
  }): Promise<{
    id: string
    url: string
    events: string[]
    isActive: boolean
    secret: string
    updatedAt: string
  }> => {
    return apiClient.patch<{
      id: string
      url: string
      events: string[]
      isActive: boolean
      secret: string
      updatedAt: string
    }>(`/payments/webhooks/${id}`, data)
  },

  deleteWebhook: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/payments/webhooks/${id}`)
  },

  testWebhook: async (id: string): Promise<{
    success: boolean
    responseCode?: number
    responseBody?: string
    error?: string
  }> => {
    return apiClient.post<{
      success: boolean
      responseCode?: number
      responseBody?: string
      error?: string
    }>(`/payments/webhooks/${id}/test`)
  },

  // Dispute Management
  getDisputes: async (params?: {
    status?: 'open' | 'under_review' | 'charge_refunded' | 'won' | 'lost'
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<{
    id: string
    transactionId: string
    amount: number
    currency: string
    status: 'open' | 'under_review' | 'charge_refunded' | 'won' | 'lost'
    reason: string
    evidence?: any
    createdAt: string
    updatedAt: string
  }>> => {
    return apiClient.get<PaginatedResponse<{
      id: string
      transactionId: string
      amount: number
      currency: string
      status: 'open' | 'under_review' | 'charge_refunded' | 'won' | 'lost'
      reason: string
      evidence?: any
      createdAt: string
      updatedAt: string
    }>>('/payments/disputes', { params })
  },

  submitDispute: async (transactionId: string, data: {
    reason: string
    evidence: any
  }): Promise<{
    id: string
    status: string
    message: string
  }> => {
    return apiClient.post<{
      id: string
      status: string
      message: string
    }>(`/payments/transactions/${transactionId}/dispute`, data)
  },

  // Currency and Exchange
  getSupportedCurrencies: async (): Promise<Array<{
    code: string
    name: string
    symbol: string
    isDefault: boolean
    exchangeRate?: number
  }>> => {
    return apiClient.get<Array<{
      code: string
      name: string
      symbol: string
      isDefault: boolean
      exchangeRate?: number
    }>>('/payments/currencies')
  },

  getExchangeRates: async (baseCurrency: string): Promise<Record<string, number>> => {
    return apiClient.get<Record<string, number>>(`/payments/exchange-rates/${baseCurrency}`)
  },

  convertCurrency: async (amount: number, from: string, to: string): Promise<{
    originalAmount: number
    convertedAmount: number
    exchangeRate: number
    fromCurrency: string
    toCurrency: string
  }> => {
    return apiClient.post<{
      originalAmount: number
      convertedAmount: number
      exchangeRate: number
      fromCurrency: string
      toCurrency: string
    }>('/payments/convert', { amount, from, to })
  }
}