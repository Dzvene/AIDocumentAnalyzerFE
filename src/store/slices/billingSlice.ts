import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { billingApi, UserBalance, Transaction, DocumentPricing, PublicPaymentSettings } from '@api/billing.api'

// Async thunks
export const fetchUserBalance = createAsyncThunk(
  'billing/fetchUserBalance',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getUserBalance()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user balance')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'billing/fetchTransactions',
  async ({ page, perPage }: { page?: number; perPage?: number } = {}, { rejectWithValue }) => {
    try {
      return await billingApi.getUserTransactions(page, perPage)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch transactions')
    }
  }
)

export const fetchDocumentPricing = createAsyncThunk(
  'billing/fetchDocumentPricing',
  async ({ documentId, estimatedPages }: { documentId: string; estimatedPages: number }, { rejectWithValue }) => {
    try {
      return await billingApi.getDocumentPricing(documentId, estimatedPages)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch document pricing')
    }
  }
)

export const processDocumentPayment = createAsyncThunk(
  'billing/processDocumentPayment',
  async ({ documentId, estimatedPages }: { documentId: string; estimatedPages: number }, { rejectWithValue, dispatch }) => {
    try {
      const result = await billingApi.processDocumentPayment(documentId, estimatedPages)
      // Refresh balance after successful payment
      dispatch(fetchUserBalance())
      return result
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Payment processing failed')
    }
  }
)

export const fetchPublicSettings = createAsyncThunk(
  'billing/fetchPublicSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getPublicSettings()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch payment settings')
    }
  }
)

// State interface
interface BillingState {
  balance: UserBalance | null
  transactions: Transaction[]
  transactionsMeta: {
    total: number
    page: number
    pages: number
    perPage: number
  }
  currentPricing: DocumentPricing | null
  publicSettings: PublicPaymentSettings | null
  loading: {
    balance: boolean
    transactions: boolean
    pricing: boolean
    payment: boolean
    settings: boolean
  }
  error: string | null
}

const initialState: BillingState = {
  balance: null,
  transactions: [],
  transactionsMeta: {
    total: 0,
    page: 1,
    pages: 0,
    perPage: 20
  },
  currentPricing: null,
  publicSettings: null,
  loading: {
    balance: false,
    transactions: false,
    pricing: false,
    payment: false,
    settings: false
  },
  error: null
}

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearPricing: (state) => {
      state.currentPricing = null
    },
    updateBalance: (state, action: PayloadAction<{ amount: number; operation: 'add' | 'subtract' }>) => {
      if (state.balance) {
        const { amount, operation } = action.payload
        if (operation === 'add') {
          state.balance.balance += amount
        } else {
          state.balance.balance = Math.max(0, state.balance.balance - amount)
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch user balance
    builder
      .addCase(fetchUserBalance.pending, (state) => {
        state.loading.balance = true
        state.error = null
      })
      .addCase(fetchUserBalance.fulfilled, (state, action) => {
        state.loading.balance = false
        state.balance = action.payload
      })
      .addCase(fetchUserBalance.rejected, (state, action) => {
        state.loading.balance = false
        state.error = action.payload as string
      })

    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading.transactions = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false
        state.transactions = action.payload.transactions
        state.transactionsMeta = {
          total: action.payload.total,
          page: action.payload.page,
          pages: action.payload.pages,
          perPage: action.payload.per_page
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading.transactions = false
        state.error = action.payload as string
      })

    // Fetch document pricing
    builder
      .addCase(fetchDocumentPricing.pending, (state) => {
        state.loading.pricing = true
        state.error = null
      })
      .addCase(fetchDocumentPricing.fulfilled, (state, action) => {
        state.loading.pricing = false
        state.currentPricing = action.payload
      })
      .addCase(fetchDocumentPricing.rejected, (state, action) => {
        state.loading.pricing = false
        state.error = action.payload as string
      })

    // Process document payment
    builder
      .addCase(processDocumentPayment.pending, (state) => {
        state.loading.payment = true
        state.error = null
      })
      .addCase(processDocumentPayment.fulfilled, (state, action) => {
        state.loading.payment = false
        // Payment successful
        if (state.currentPricing) {
          // Deduct the amount from balance
          if (state.balance) {
            state.balance.balance = Math.max(0, state.balance.balance - state.currentPricing.total_price)
          }
        }
      })
      .addCase(processDocumentPayment.rejected, (state, action) => {
        state.loading.payment = false
        state.error = action.payload as string
      })

    // Fetch public settings
    builder
      .addCase(fetchPublicSettings.pending, (state) => {
        state.loading.settings = true
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.loading.settings = false
        state.publicSettings = action.payload
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        state.loading.settings = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearPricing, updateBalance } = billingSlice.actions
export default billingSlice.reducer

// Selectors
export const selectUserBalance = (state: { billing: BillingState }) => state.billing.balance
export const selectTransactions = (state: { billing: BillingState }) => state.billing.transactions
export const selectCurrentPricing = (state: { billing: BillingState }) => state.billing.currentPricing
export const selectPublicSettings = (state: { billing: BillingState }) => state.billing.publicSettings
export const selectBillingLoading = (state: { billing: BillingState }) => state.billing.loading
export const selectBillingError = (state: { billing: BillingState }) => state.billing.error