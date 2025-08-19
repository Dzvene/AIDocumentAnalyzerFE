import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

export type DeliveryType = 
  | 'shop_delivery'        // Доставка продавцом
  | 'third_party'          // Сторонняя компания доставки
  | 'courier'              // Частный курьер
  | 'self_pickup'          // Самовывоз
  | 'marketplace_delivery' // Собственная доставка маркетплейса

export interface DeliveryTimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  available: boolean
  price?: number
}

export interface PickupPoint {
  id: string
  shopId: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  workingHours: {
    open: string
    close: string
  }
  phone?: string
  description?: string
}

export interface Courier {
  id: string
  name: string
  rating: number
  reviewsCount: number
  photo?: string
  vehicle: 'bicycle' | 'scooter' | 'car' | 'walking'
  isAvailable: boolean
  estimatedTime: string
  price: number
}

export interface ThirdPartyService {
  id: string
  name: string
  logo: string
  rating: number
  estimatedTime: string
  price: number
  trackingAvailable: boolean
}

export interface DeliveryAddress {
  id: string
  street: string
  building: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  comment?: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface DeliveryOption {
  type: DeliveryType
  available: boolean
  price: number
  estimatedTime: string
  minOrderAmount?: number
  maxDistance?: number
  description?: string
  provider?: Courier | ThirdPartyService
}

interface DeliveryState {
  availableOptions: {
    [shopId: string]: DeliveryOption[]
  }
  selectedOptions: {
    [shopId: string]: {
      type: DeliveryType
      details: any
    }
  }
  deliveryAddress: DeliveryAddress | null
  pickupPoints: {
    [shopId: string]: PickupPoint[]
  }
  selectedPickupPoint: {
    [shopId: string]: string
  }
  timeSlots: {
    [shopId: string]: DeliveryTimeSlot[]
  }
  selectedTimeSlot: {
    [shopId: string]: string
  }
  availableCouriers: Courier[]
  selectedCourier: {
    [shopId: string]: string
  }
  thirdPartyServices: ThirdPartyService[]
  marketplaceDeliveryInfo: {
    available: boolean
    price: number
    estimatedTime: string
    drivers: number
  }
  deliveryCosts: {
    [shopId: string]: number
  }
  loading: boolean
  error: string | null
}

const initialState: DeliveryState = {
  availableOptions: {},
  selectedOptions: {},
  deliveryAddress: null,
  pickupPoints: {},
  selectedPickupPoint: {},
  timeSlots: {},
  selectedTimeSlot: {},
  availableCouriers: [],
  selectedCourier: {},
  thirdPartyServices: [],
  marketplaceDeliveryInfo: {
    available: false,
    price: 0,
    estimatedTime: '',
    drivers: 0
  },
  deliveryCosts: {},
  loading: false,
  error: null
}

export const fetchDeliveryOptions = createAsyncThunk(
  'delivery/fetchOptions',
  async ({ shopId, addressId }: { shopId: string; addressId: string }) => {
    const response = await fetch(`/api/shops/${shopId}/delivery-options?addressId=${addressId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch delivery options')
    }
    return { shopId, options: await response.json() }
  }
)

export const fetchPickupPoints = createAsyncThunk(
  'delivery/fetchPickupPoints',
  async (shopId: string) => {
    const response = await fetch(`/api/shops/${shopId}/pickup-points`)
    if (!response.ok) {
      throw new Error('Failed to fetch pickup points')
    }
    return { shopId, points: await response.json() }
  }
)

export const fetchAvailableCouriers = createAsyncThunk(
  'delivery/fetchCouriers',
  async ({ shopId, addressId }: { shopId: string; addressId: string }) => {
    const response = await fetch(`/api/delivery/couriers?shopId=${shopId}&addressId=${addressId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch available couriers')
    }
    return response.json()
  }
)

export const fetchThirdPartyServices = createAsyncThunk(
  'delivery/fetchThirdPartyServices',
  async ({ shopId, addressId }: { shopId: string; addressId: string }) => {
    const response = await fetch(`/api/delivery/third-party?shopId=${shopId}&addressId=${addressId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch third party services')
    }
    return response.json()
  }
)

export const calculateDeliveryCost = createAsyncThunk(
  'delivery/calculateCost',
  async ({ shopId, addressId, type }: { shopId: string; addressId: string; type: DeliveryType }) => {
    const response = await fetch('/api/delivery/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId, addressId, type })
    })
    if (!response.ok) {
      throw new Error('Failed to calculate delivery cost')
    }
    return { shopId, cost: await response.json() }
  }
)

export const fetchTimeSlots = createAsyncThunk(
  'delivery/fetchTimeSlots',
  async ({ shopId, type, date }: { shopId: string; type: DeliveryType; date: string }) => {
    const response = await fetch(`/api/delivery/time-slots?shopId=${shopId}&type=${type}&date=${date}`)
    if (!response.ok) {
      throw new Error('Failed to fetch time slots')
    }
    return { shopId, slots: await response.json() }
  }
)

export const bookCourier = createAsyncThunk(
  'delivery/bookCourier',
  async ({ shopId, courierId, timeSlotId }: { shopId: string; courierId: string; timeSlotId: string }) => {
    const response = await fetch('/api/delivery/book-courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId, courierId, timeSlotId })
    })
    if (!response.ok) {
      throw new Error('Failed to book courier')
    }
    return response.json()
  }
)

export const checkMarketplaceDelivery = createAsyncThunk(
  'delivery/checkMarketplace',
  async ({ shopIds, addressId }: { shopIds: string[]; addressId: string }) => {
    const response = await fetch('/api/delivery/marketplace/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopIds, addressId })
    })
    if (!response.ok) {
      throw new Error('Failed to check marketplace delivery')
    }
    return response.json()
  }
)

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setDeliveryAddress: (state, action: PayloadAction<DeliveryAddress>) => {
      state.deliveryAddress = action.payload
    },
    
    selectDeliveryOption: (state, action: PayloadAction<{ shopId: string; type: DeliveryType; details?: any }>) => {
      const { shopId, type, details } = action.payload
      state.selectedOptions[shopId] = { type, details }
    },
    
    selectPickupPoint: (state, action: PayloadAction<{ shopId: string; pointId: string }>) => {
      const { shopId, pointId } = action.payload
      state.selectedPickupPoint[shopId] = pointId
    },
    
    selectTimeSlot: (state, action: PayloadAction<{ shopId: string; slotId: string }>) => {
      const { shopId, slotId } = action.payload
      state.selectedTimeSlot[shopId] = slotId
    },
    
    selectCourier: (state, action: PayloadAction<{ shopId: string; courierId: string }>) => {
      const { shopId, courierId } = action.payload
      state.selectedCourier[shopId] = courierId
    },
    
    clearDeliveryOptions: (state, action: PayloadAction<string>) => {
      const shopId = action.payload
      delete state.availableOptions[shopId]
      delete state.selectedOptions[shopId]
      delete state.pickupPoints[shopId]
      delete state.selectedPickupPoint[shopId]
      delete state.timeSlots[shopId]
      delete state.selectedTimeSlot[shopId]
      delete state.selectedCourier[shopId]
      delete state.deliveryCosts[shopId]
    },
    
    clearAllDeliveryData: (state) => {
      state.availableOptions = {}
      state.selectedOptions = {}
      state.pickupPoints = {}
      state.selectedPickupPoint = {}
      state.timeSlots = {}
      state.selectedTimeSlot = {}
      state.selectedCourier = {}
      state.deliveryCosts = {}
      state.availableCouriers = []
      state.thirdPartyServices = []
    },
    
    updateDeliveryCost: (state, action: PayloadAction<{ shopId: string; cost: number }>) => {
      const { shopId, cost } = action.payload
      state.deliveryCosts[shopId] = cost
    },
    
    setMarketplaceDeliveryInfo: (state, action: PayloadAction<typeof initialState.marketplaceDeliveryInfo>) => {
      state.marketplaceDeliveryInfo = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryOptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeliveryOptions.fulfilled, (state, action) => {
        const { shopId, options } = action.payload
        state.availableOptions[shopId] = options
        state.loading = false
      })
      .addCase(fetchDeliveryOptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch delivery options'
      })
      
      .addCase(fetchPickupPoints.fulfilled, (state, action) => {
        const { shopId, points } = action.payload
        state.pickupPoints[shopId] = points
      })
      
      .addCase(fetchAvailableCouriers.fulfilled, (state, action) => {
        state.availableCouriers = action.payload
      })
      
      .addCase(fetchThirdPartyServices.fulfilled, (state, action) => {
        state.thirdPartyServices = action.payload
      })
      
      .addCase(calculateDeliveryCost.fulfilled, (state, action) => {
        const { shopId, cost } = action.payload
        state.deliveryCosts[shopId] = cost.amount
      })
      
      .addCase(fetchTimeSlots.fulfilled, (state, action) => {
        const { shopId, slots } = action.payload
        state.timeSlots[shopId] = slots
      })
      
      .addCase(checkMarketplaceDelivery.fulfilled, (state, action) => {
        state.marketplaceDeliveryInfo = action.payload
      })
  }
})

export const {
  setDeliveryAddress,
  selectDeliveryOption,
  selectPickupPoint,
  selectTimeSlot,
  selectCourier,
  clearDeliveryOptions,
  clearAllDeliveryData,
  updateDeliveryCost,
  setMarketplaceDeliveryInfo
} = deliverySlice.actions

export const selectDeliveryOptions = (shopId: string) => (state: RootState) => 
  state.delivery.availableOptions[shopId] || []

export const selectSelectedDeliveryOption = (shopId: string) => (state: RootState) =>
  state.delivery.selectedOptions[shopId]

export const selectPickupPointsForShop = (shopId: string) => (state: RootState) =>
  state.delivery.pickupPoints[shopId] || []

export const selectSelectedPickupPoint = (shopId: string) => (state: RootState) => {
  const pointId = state.delivery.selectedPickupPoint[shopId]
  const points = state.delivery.pickupPoints[shopId] || []
  return points.find(p => p.id === pointId)
}

export const selectDeliveryAddress = (state: RootState) => state.delivery.deliveryAddress

export const selectAvailableCouriers = (state: RootState) => state.delivery.availableCouriers

export const selectThirdPartyServices = (state: RootState) => state.delivery.thirdPartyServices

export const selectDeliveryCost = (shopId: string) => (state: RootState) =>
  state.delivery.deliveryCosts[shopId] || 0

export const selectMarketplaceDeliveryInfo = (state: RootState) => state.delivery.marketplaceDeliveryInfo

export const selectTimeSlotsForShop = (shopId: string) => (state: RootState) =>
  state.delivery.timeSlots[shopId] || []

export const selectSelectedTimeSlot = (shopId: string) => (state: RootState) => {
  const slotId = state.delivery.selectedTimeSlot[shopId]
  const slots = state.delivery.timeSlots[shopId] || []
  return slots.find(s => s.id === slotId)
}

export default deliverySlice.reducer