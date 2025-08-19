import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash_on_delivery'
  name: string
  details: {
    cardNumber?: string
    expiryDate?: string
    holderName?: string
    cvv?: string
    email?: string
    accountNumber?: string
    routingNumber?: string
    walletAddress?: string
  }
  isDefault: boolean
  isActive: boolean
  createdAt: string
}

interface PaymentTransaction {
  id: string
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod['type']
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  gatewayTransactionId?: string
  gatewayResponse?: any
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

interface CheckoutData {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  shippingAddress?: any
  billingAddress?: any
  selectedPaymentMethod?: PaymentMethod
  selectedShippingMethod?: string
  appliedCoupon?: string
  notes?: string
}

interface PaymentState {
  paymentMethods: PaymentMethod[]
  selectedPaymentMethod: PaymentMethod | null
  currentTransaction: PaymentTransaction | null
  transactions: PaymentTransaction[]
  checkoutData: CheckoutData | null
  supportedMethods: PaymentMethod['type'][]
  processingPayment: boolean
  loading: boolean
  error: string | null
  step: 'shipping' | 'payment' | 'review' | 'processing' | 'success' | 'failed'
  paymentGateways: {
    stripe: {
      publicKey?: string
      clientSecret?: string
    }
    paypal: {
      clientId?: string
    }
  }
}

const initialState: PaymentState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  currentTransaction: null,
  transactions: [],
  checkoutData: null,
  supportedMethods: ['card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
  processingPayment: false,
  loading: false,
  error: null,
  step: 'shipping',
  paymentGateways: {
    stripe: {},
    paypal: {}
  }
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
      state.paymentMethods = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedPaymentMethod: (state, action: PayloadAction<PaymentMethod | null>) => {
      state.selectedPaymentMethod = action.payload
    },
    setCurrentTransaction: (state, action: PayloadAction<PaymentTransaction | null>) => {
      state.currentTransaction = action.payload
    },
    setTransactions: (state, action: PayloadAction<PaymentTransaction[]>) => {
      state.transactions = action.payload
    },
    setCheckoutData: (state, action: PayloadAction<CheckoutData>) => {
      state.checkoutData = action.payload
    },
    updateCheckoutData: (state, action: PayloadAction<Partial<CheckoutData>>) => {
      if (state.checkoutData) {
        state.checkoutData = { ...state.checkoutData, ...action.payload }
      }
    },
    setSupportedMethods: (state, action: PayloadAction<PaymentMethod['type'][]>) => {
      state.supportedMethods = action.payload
    },
    setProcessingPayment: (state, action: PayloadAction<boolean>) => {
      state.processingPayment = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
      state.processingPayment = false
    },
    setStep: (state, action: PayloadAction<PaymentState['step']>) => {
      state.step = action.payload
    },
    setPaymentGateways: (state, action: PayloadAction<Partial<PaymentState['paymentGateways']>>) => {
      state.paymentGateways = { ...state.paymentGateways, ...action.payload }
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      if (action.payload.isDefault) {
        state.paymentMethods.forEach(method => {
          method.isDefault = false
        })
      }
      state.paymentMethods.push(action.payload)
    },
    updatePaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      const index = state.paymentMethods.findIndex(method => method.id === action.payload.id)
      if (index !== -1) {
        if (action.payload.isDefault) {
          state.paymentMethods.forEach(method => {
            method.isDefault = false
          })
        }
        state.paymentMethods[index] = action.payload
      }
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      const removedMethod = state.paymentMethods.find(method => method.id === action.payload)
      state.paymentMethods = state.paymentMethods.filter(method => method.id !== action.payload)
      
      if (removedMethod?.isDefault && state.paymentMethods.length > 0) {
        state.paymentMethods[0].isDefault = true
      }
      
      if (state.selectedPaymentMethod?.id === action.payload) {
        state.selectedPaymentMethod = null
      }
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods.forEach(method => {
        method.isDefault = method.id === action.payload
      })
    },
    addTransaction: (state, action: PayloadAction<PaymentTransaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<PaymentTransaction>) => {
      const index = state.transactions.findIndex(tx => tx.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = action.payload
      }
      if (state.currentTransaction?.id === action.payload.id) {
        state.currentTransaction = action.payload
      }
    },
    updateTransactionStatus: (state, action: PayloadAction<{ 
      transactionId: string
      status: PaymentTransaction['status']
      gatewayResponse?: any
      failureReason?: string
    }>) => {
      const { transactionId, status, gatewayResponse, failureReason } = action.payload
      
      const transaction = state.transactions.find(tx => tx.id === transactionId)
      if (transaction) {
        transaction.status = status
        transaction.updatedAt = new Date().toISOString()
        if (status === 'completed') {
          transaction.completedAt = new Date().toISOString()
        }
        if (gatewayResponse) {
          transaction.gatewayResponse = gatewayResponse
        }
        if (failureReason) {
          transaction.failureReason = failureReason
        }
      }
      
      if (state.currentTransaction?.id === transactionId) {
        state.currentTransaction.status = status
        state.currentTransaction.updatedAt = new Date().toISOString()
        if (status === 'completed') {
          state.currentTransaction.completedAt = new Date().toISOString()
        }
        if (gatewayResponse) {
          state.currentTransaction.gatewayResponse = gatewayResponse
        }
        if (failureReason) {
          state.currentTransaction.failureReason = failureReason
        }
      }
    },
    clearCheckoutData: (state) => {
      state.checkoutData = null
      state.selectedPaymentMethod = null
      state.currentTransaction = null
      state.step = 'shipping'
      state.error = null
    },
    nextStep: (state) => {
      const steps: PaymentState['step'][] = ['shipping', 'payment', 'review', 'processing', 'success']
      const currentIndex = steps.indexOf(state.step)
      if (currentIndex < steps.length - 1) {
        state.step = steps[currentIndex + 1]
      }
    },
    previousStep: (state) => {
      const steps: PaymentState['step'][] = ['shipping', 'payment', 'review', 'processing', 'success']
      const currentIndex = steps.indexOf(state.step)
      if (currentIndex > 0) {
        state.step = steps[currentIndex - 1]
      }
    },
    resetPaymentFlow: (state) => {
      state.step = 'shipping'
      state.processingPayment = false
      state.error = null
      state.currentTransaction = null
    }
  }
})

export const {
  setPaymentMethods,
  setSelectedPaymentMethod,
  setCurrentTransaction,
  setTransactions,
  setCheckoutData,
  updateCheckoutData,
  setSupportedMethods,
  setProcessingPayment,
  setLoading,
  setError,
  setStep,
  setPaymentGateways,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  addTransaction,
  updateTransaction,
  updateTransactionStatus,
  clearCheckoutData,
  nextStep,
  previousStep,
  resetPaymentFlow
} = paymentSlice.actions

export default paymentSlice.reducer