import axios from './axios'

// Types
export interface UserBalance {
  balance: number
  currency: string
  user_id: string  // Changed from number to string to handle UUID
}

export interface Transaction {
  id: number
  transaction_id: string
  amount: number
  currency: string
  net_amount: number
  fee_amount: number
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'document_analysis' | 'admin_adjustment'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  payment_provider: 'stripe' | 'paypal' | 'admin' | 'system'
  description?: string
  created_at: string
  completed_at?: string
}

export interface PaymentIntent {
  client_secret: string
  payment_intent_id: string
  amount: number
  currency: string
  status: string
  transaction_id: string
}

export interface PayPalOrder {
  order_id: string
  approval_url: string
  amount: number
  currency: string
  status: string
  transaction_id: string
}

export interface DocumentPricing {
  page_count: number
  price_per_page: number
  total_price: number
  currency: string
  user_balance: number
  has_sufficient_balance: boolean
  tier_info: string
}

export interface PublicPaymentSettings {
  stripe_enabled: boolean
  stripe_public_key?: string
  paypal_enabled: boolean
  paypal_client_id?: string
  paypal_environment: string
  currency: string
  minimum_deposit: number
  maximum_deposit: number
  recommended_amounts: number[]
  pricing_tiers: {
    [key: string]: {
      max_pages: number | string
      rate: number
      description: string
    }
  }
}

export interface TransactionListResponse {
  transactions: Transaction[]
  total: number
  page: number
  per_page: number
  pages: number
}

// API calls
export const billingApi = {
  // Get user balance
  getUserBalance: (): Promise<UserBalance> => 
    axios.get('/billing/balance'),

  // Create deposit via Stripe
  createStripeDeposit: (amount: number, returnUrl?: string, cancelUrl?: string): Promise<PaymentIntent> =>
    axios.post('/billing/deposit/stripe', {
      amount,
      currency: 'EUR',
      return_url: returnUrl,
      cancel_url: cancelUrl
    }),

  // Create deposit via PayPal
  createPayPalDeposit: (amount: number, returnUrl?: string, cancelUrl?: string): Promise<PayPalOrder> =>
    axios.post('/billing/deposit/paypal', {
      amount,
      currency: 'EUR',
      return_url: returnUrl,
      cancel_url: cancelUrl
    }),

  // Get document pricing
  getDocumentPricing: (documentId: string, estimatedPages: number): Promise<DocumentPricing> =>
    axios.post('/billing/document/pricing', {
      document_id: documentId,
      estimated_pages: estimatedPages
    }),

  // Process document payment
  processDocumentPayment: (documentId: string, estimatedPages: number): Promise<{ status: string; message: string }> =>
    axios.post('/billing/document/process', {
      document_id: documentId,
      estimated_pages: estimatedPages
    }),

  // Get user transactions
  getUserTransactions: (page: number = 1, perPage: number = 20): Promise<TransactionListResponse> =>
    axios.get('/billing/transactions', {
      params: { page, per_page: perPage }
    }),

  // Capture PayPal order
  capturePayPalOrder: (orderId: string): Promise<{ status: string; capture_id: string; transaction_id: string; paypal_status: string }> =>
    axios.post(`/billing/paypal/capture/${orderId}`),

  // Get public payment settings (no auth required)
  getPublicSettings: (): Promise<PublicPaymentSettings> =>
    axios.get('/billing/settings/public')
}