import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'
import { Shop } from './locationSlice'

export interface AdShop extends Shop {
  adType: 'premium' | 'promoted' | 'new' | 'special'
  adBudget?: number
  adExpiry?: string
  ctr?: number
  impressions?: number
  priority: number
}

export interface AdCampaign {
  id: string
  shopId: string
  type: 'slider' | 'category' | 'search' | 'banner'
  budget: number
  spent: number
  startDate: string
  endDate: string
  targetRadius: number
  targetCategories?: string[]
  performance: {
    impressions: number
    clicks: number
    ctr: number
    conversions: number
  }
}

export type SubscriptionTier = 'free' | 'plus' | 'family'
export type ShopTier = 'free' | 'business' | 'professional' | 'enterprise'

interface UserSubscription {
  tier: SubscriptionTier
  benefits: {
    freeDeliveryThreshold: number
    deliveryDiscount: number
    cashbackRate: number
    prioritySupport: boolean
    exclusiveOffers: boolean
    familyMembers?: number
  }
  expiresAt: string | null
  autoRenew: boolean
}

interface AdvertisingState {
  // Рекламные магазины
  premiumSlider: AdShop[]
  categoryPromoted: {
    [categoryId: string]: AdShop[]
  }
  nearbyPromoted: AdShop[]
  
  // Подписки
  userSubscription: UserSubscription
  
  // Аналитика для владельца
  shopAnalytics: {
    tier: ShopTier
    commission: number
    adsSpent: number
    totalRevenue: number
    activeCompaigns: AdCampaign[]
  } | null
  
  // Отслеживание
  viewedAds: string[] // Shop IDs that were shown
  clickedAds: string[] // Shop IDs that were clicked
  
  loading: boolean
  error: string | null
}

const initialState: AdvertisingState = {
  premiumSlider: [],
  categoryPromoted: {},
  nearbyPromoted: [],
  userSubscription: {
    tier: 'free',
    benefits: {
      freeDeliveryThreshold: 25,
      deliveryDiscount: 0,
      cashbackRate: 0,
      prioritySupport: false,
      exclusiveOffers: false
    },
    expiresAt: null,
    autoRenew: false
  },
  shopAnalytics: null,
  viewedAds: [],
  clickedAds: [],
  loading: false,
  error: null
}

// Async thunks
export const fetchPremiumShops = createAsyncThunk(
  'advertising/fetchPremium',
  async ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
    const response = await fetch(
      `/api/ads/premium-shops?lat=${lat}&lng=${lng}&radius=${radius * 1.5}` // Расширенный радиус для рекламы
    )
    if (!response.ok) throw new Error('Failed to fetch premium shops')
    return response.json()
  }
)

export const fetchCategoryPromoted = createAsyncThunk(
  'advertising/fetchCategoryPromoted',
  async ({ categoryId, lat, lng }: { categoryId: string; lat: number; lng: number }) => {
    const response = await fetch(
      `/api/ads/category/${categoryId}/promoted?lat=${lat}&lng=${lng}`
    )
    if (!response.ok) throw new Error('Failed to fetch promoted shops')
    return { categoryId, shops: await response.json() }
  }
)

export const trackAdImpression = createAsyncThunk(
  'advertising/trackImpression',
  async (shopId: string) => {
    await fetch('/api/ads/track-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId, timestamp: Date.now() })
    })
    return shopId
  }
)

export const trackAdClick = createAsyncThunk(
  'advertising/trackClick',
  async ({ shopId, position }: { shopId: string; position: string }) => {
    await fetch('/api/ads/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId, position, timestamp: Date.now() })
    })
    return shopId
  }
)

export const checkUserSubscription = createAsyncThunk(
  'advertising/checkSubscription',
  async () => {
    const response = await fetch('/api/subscriptions/user')
    if (!response.ok) throw new Error('Failed to check subscription')
    return response.json()
  }
)

export const subscribeUser = createAsyncThunk(
  'advertising/subscribe',
  async (tier: SubscriptionTier) => {
    const response = await fetch('/api/subscriptions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    })
    if (!response.ok) throw new Error('Failed to subscribe')
    return response.json()
  }
)

export const fetchShopAnalytics = createAsyncThunk(
  'advertising/fetchShopAnalytics',
  async (shopId: string) => {
    const response = await fetch(`/api/shops/${shopId}/analytics`)
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  }
)

const advertisingSlice = createSlice({
  name: 'advertising',
  initialState,
  reducers: {
    clearViewedAds: (state) => {
      state.viewedAds = []
    },
    
    clearClickedAds: (state) => {
      state.clickedAds = []
    },
    
    setPremiumSlider: (state, action: PayloadAction<AdShop[]>) => {
      state.premiumSlider = action.payload
    },
    
    updateSubscriptionBenefits: (state, action: PayloadAction<Partial<UserSubscription>>) => {
      state.userSubscription = { ...state.userSubscription, ...action.payload }
    },
    
    addViewedAd: (state, action: PayloadAction<string>) => {
      if (!state.viewedAds.includes(action.payload)) {
        state.viewedAds.push(action.payload)
      }
    },
    
    addClickedAd: (state, action: PayloadAction<string>) => {
      if (!state.clickedAds.includes(action.payload)) {
        state.clickedAds.push(action.payload)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch premium shops
      .addCase(fetchPremiumShops.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPremiumShops.fulfilled, (state, action) => {
        state.premiumSlider = action.payload.shops
        state.loading = false
      })
      .addCase(fetchPremiumShops.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch premium shops'
      })
      
      // Fetch category promoted
      .addCase(fetchCategoryPromoted.fulfilled, (state, action) => {
        const { categoryId, shops } = action.payload
        state.categoryPromoted[categoryId] = shops
      })
      
      // Track impression
      .addCase(trackAdImpression.fulfilled, (state, action) => {
        state.addViewedAd(action.payload)
      })
      
      // Track click
      .addCase(trackAdClick.fulfilled, (state, action) => {
        state.addClickedAd(action.payload)
      })
      
      // Check subscription
      .addCase(checkUserSubscription.fulfilled, (state, action) => {
        state.userSubscription = action.payload
      })
      
      // Subscribe
      .addCase(subscribeUser.fulfilled, (state, action) => {
        state.userSubscription = action.payload
      })
      
      // Shop analytics
      .addCase(fetchShopAnalytics.fulfilled, (state, action) => {
        state.shopAnalytics = action.payload
      })
  }
})

export const {
  clearViewedAds,
  clearClickedAds,
  setPremiumSlider,
  updateSubscriptionBenefits,
  addViewedAd,
  addClickedAd
} = advertisingSlice.actions

// Selectors
export const selectPremiumSlider = (state: RootState) => state.advertising.premiumSlider
export const selectUserSubscription = (state: RootState) => state.advertising.userSubscription
export const selectIsSubscribed = (state: RootState) => 
  state.advertising.userSubscription.tier !== 'free'
export const selectDeliveryDiscount = (state: RootState) => 
  state.advertising.userSubscription.benefits.deliveryDiscount
export const selectFreeDeliveryThreshold = (state: RootState) => 
  state.advertising.userSubscription.benefits.freeDeliveryThreshold
export const selectCategoryPromoted = (categoryId: string) => (state: RootState) => 
  state.advertising.categoryPromoted[categoryId] || []
export const selectShopAnalytics = (state: RootState) => state.advertising.shopAnalytics

// Helper selector for checking if user has any premium benefits
export const selectHasPremiumBenefits = (state: RootState) => {
  const tier = state.advertising.userSubscription.tier
  return tier === 'plus' || tier === 'family'
}

// Helper selector for calculating final delivery fee with subscription
export const selectFinalDeliveryFee = (deliveryFee: number) => (state: RootState) => {
  const discount = state.advertising.userSubscription.benefits.deliveryDiscount
  return deliveryFee * (1 - discount / 100)
}

export default advertisingSlice.reducer