import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Offer {
  id: string
  title: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  code?: string
  image?: string
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  userUsageLimit?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  excludedProducts?: string[]
  excludedCategories?: string[]
  targetAudience: 'all' | 'new_users' | 'existing_users' | 'vip_users'
  priority: number
  createdAt: string
  updatedAt: string
  terms?: string
  shopId?: string
  shopName?: string
}

interface UserOffer {
  id: string
  offerId: string
  userId: string
  usageCount: number
  lastUsed?: string
  isEligible: boolean
}

interface OffersState {
  offers: Offer[]
  userOffers: UserOffer[]
  selectedOffer: Offer | null
  activeOffers: Offer[]
  featuredOffers: Offer[]
  availableOffers: Offer[]
  expiringSoon: Offer[]
  appliedOffer: Offer | null
  loading: boolean
  error: string | null
  filters: {
    type: Offer['type'] | null
    isActive: boolean | null
    searchQuery: string
    category: string | null
    minDiscount: number | null
    maxDiscount: number | null
    sortBy: 'newest' | 'ending_soon' | 'discount_high' | 'discount_low'
  }
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
}

const initialState: OffersState = {
  offers: [],
  userOffers: [],
  selectedOffer: null,
  activeOffers: [],
  featuredOffers: [],
  availableOffers: [],
  expiringSoon: [],
  appliedOffer: null,
  loading: false,
  error: null,
  filters: {
    type: null,
    isActive: null,
    searchQuery: '',
    category: null,
    minDiscount: null,
    maxDiscount: null,
    sortBy: 'newest'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalItems: 0
  }
}

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    setOffers: (state, action: PayloadAction<Offer[]>) => {
      state.offers = action.payload
      state.loading = false
      state.error = null
    },
    setUserOffers: (state, action: PayloadAction<UserOffer[]>) => {
      state.userOffers = action.payload
    },
    setSelectedOffer: (state, action: PayloadAction<Offer | null>) => {
      state.selectedOffer = action.payload
    },
    setActiveOffers: (state, action: PayloadAction<Offer[]>) => {
      state.activeOffers = action.payload
    },
    setFeaturedOffers: (state, action: PayloadAction<Offer[]>) => {
      state.featuredOffers = action.payload
    },
    setAvailableOffers: (state, action: PayloadAction<Offer[]>) => {
      state.availableOffers = action.payload
    },
    setExpiringSoon: (state, action: PayloadAction<Offer[]>) => {
      state.expiringSoon = action.payload
    },
    setAppliedOffer: (state, action: PayloadAction<Offer | null>) => {
      state.appliedOffer = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<OffersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action: PayloadAction<Partial<OffersState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addOffer: (state, action: PayloadAction<Offer>) => {
      state.offers.unshift(action.payload)
    },
    updateOffer: (state, action: PayloadAction<Offer>) => {
      const index = state.offers.findIndex(offer => offer.id === action.payload.id)
      if (index !== -1) {
        state.offers[index] = action.payload
      }
      if (state.selectedOffer?.id === action.payload.id) {
        state.selectedOffer = action.payload
      }
      if (state.appliedOffer?.id === action.payload.id) {
        state.appliedOffer = action.payload
      }
    },
    removeOffer: (state, action: PayloadAction<string>) => {
      state.offers = state.offers.filter(offer => offer.id !== action.payload)
      if (state.selectedOffer?.id === action.payload) {
        state.selectedOffer = null
      }
      if (state.appliedOffer?.id === action.payload) {
        state.appliedOffer = null
      }
    },
    incrementOfferUsage: (state, action: PayloadAction<string>) => {
      const offer = state.offers.find(o => o.id === action.payload)
      if (offer) {
        offer.usageCount++
      }
    },
    toggleOfferStatus: (state, action: PayloadAction<string>) => {
      const offer = state.offers.find(o => o.id === action.payload)
      if (offer) {
        offer.isActive = !offer.isActive
      }
    },
    applyOfferCode: (state, action: PayloadAction<{ code: string; offer: Offer }>) => {
      state.appliedOffer = action.payload.offer
    },
    removeAppliedOffer: (state) => {
      state.appliedOffer = null
    },
    updateUserOfferUsage: (state, action: PayloadAction<{ offerId: string; usageCount: number }>) => {
      const userOffer = state.userOffers.find(uo => uo.offerId === action.payload.offerId)
      if (userOffer) {
        userOffer.usageCount = action.payload.usageCount
        userOffer.lastUsed = new Date().toISOString()
      }
    },
    addUserOffer: (state, action: PayloadAction<UserOffer>) => {
      const existingIndex = state.userOffers.findIndex(
        uo => uo.offerId === action.payload.offerId && uo.userId === action.payload.userId
      )
      if (existingIndex !== -1) {
        state.userOffers[existingIndex] = action.payload
      } else {
        state.userOffers.push(action.payload)
      }
    },
    filterActiveOffers: (state) => {
      const now = new Date().toISOString()
      state.activeOffers = state.offers.filter(
        offer => offer.isActive && offer.startDate <= now && offer.endDate >= now
      )
    },
    filterExpiringSoon: (state) => {
      const now = new Date()
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      
      state.expiringSoon = state.activeOffers.filter(
        offer => offer.endDate <= threeDaysFromNow
      )
    }
  }
})

export const {
  setOffers,
  setUserOffers,
  setSelectedOffer,
  setActiveOffers,
  setFeaturedOffers,
  setAvailableOffers,
  setExpiringSoon,
  setAppliedOffer,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  addOffer,
  updateOffer,
  removeOffer,
  incrementOfferUsage,
  toggleOfferStatus,
  applyOfferCode,
  removeAppliedOffer,
  updateUserOfferUsage,
  addUserOffer,
  filterActiveOffers,
  filterExpiringSoon
} = offersSlice.actions

export default offersSlice.reducer