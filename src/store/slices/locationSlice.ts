import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  id: string
  name: string
  street: string
  city: string
  postalCode: string
  country: string
  coordinates: Coordinates
  isDefault?: boolean
}

export interface Shop {
  id: string
  name: string
  description: string
  logo?: string
  rating: number
  reviewsCount: number
  coordinates: Coordinates
  address: string
  distance: number
  isOpen: boolean
  workingHours: {
    open: string
    close: string
  }
  deliveryOptions: {
    shopDelivery: boolean
    thirdPartyDelivery: boolean
    courierDelivery: boolean
    selfPickup: boolean
    marketplaceDelivery: boolean
  }
  minOrderAmount: number
  deliveryFee: number
  estimatedDeliveryTime: string
  categories: string[]
  tags: string[]
}

export type SearchRadius = 2 | 5 | 10 | 15 | 20

interface LocationState {
  userLocation: {
    coordinates: Coordinates
    address?: string
    timestamp: number
  } | null
  savedAddresses: Address[]
  selectedAddressId: string | null
  searchRadius: SearchRadius
  availableShops: Shop[]
  nearbyShopsCount: {
    [K in SearchRadius]: number
  }
  loadingShops: boolean
  locationPermission: 'granted' | 'denied' | 'prompt' | null
  error: string | null
}

const initialState: LocationState = {
  userLocation: null,
  savedAddresses: [],
  selectedAddressId: null,
  searchRadius: 2,
  availableShops: [],
  nearbyShopsCount: {
    2: 0,
    5: 0,
    10: 0,
    15: 0,
    20: 0
  },
  loadingShops: false,
  locationPermission: null,
  error: null
}

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          { 
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      }
    })
  }
)

export const fetchNearbyShops = createAsyncThunk(
  'location/fetchNearbyShops',
  async ({ coordinates, radius }: { coordinates: Coordinates; radius: SearchRadius }) => {
    const response = await fetch(
      `/api/shops/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch nearby shops')
    }
    return response.json()
  }
)

export const fetchShopsCountByRadius = createAsyncThunk(
  'location/fetchShopsCountByRadius',
  async (coordinates: Coordinates) => {
    const radiuses: SearchRadius[] = [2, 5, 10, 15, 20]
    const counts: Partial<{ [K in SearchRadius]: number }> = {}
    
    await Promise.all(
      radiuses.map(async (radius) => {
        const response = await fetch(
          `/api/shops/count?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}`
        )
        if (response.ok) {
          const data = await response.json()
          counts[radius] = data.count
        }
      })
    )
    
    return counts as { [K in SearchRadius]: number }
  }
)

export const saveAddress = createAsyncThunk(
  'location/saveAddress',
  async (address: Omit<Address, 'id'>) => {
    const response = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    })
    if (!response.ok) {
      throw new Error('Failed to save address')
    }
    return response.json()
  }
)

export const deleteAddress = createAsyncThunk(
  'location/deleteAddress',
  async (addressId: string) => {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete address')
    }
    return addressId
  }
)

export const geocodeAddress = createAsyncThunk(
  'location/geocodeAddress',
  async (address: string) => {
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    })
    if (!response.ok) {
      throw new Error('Failed to geocode address')
    }
    return response.json()
  }
)

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setUserLocation: (state, action: PayloadAction<{ coordinates: Coordinates; address?: string }>) => {
      state.userLocation = {
        coordinates: action.payload.coordinates,
        address: action.payload.address,
        timestamp: Date.now()
      }
    },
    setSelectedAddress: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload
      const address = state.savedAddresses.find(a => a.id === action.payload)
      if (address) {
        state.userLocation = {
          coordinates: address.coordinates,
          address: `${address.street}, ${address.city}`,
          timestamp: Date.now()
        }
      }
    },
    setSearchRadius: (state, action: PayloadAction<SearchRadius>) => {
      state.searchRadius = action.payload
    },
    setLocationPermission: (state, action: PayloadAction<'granted' | 'denied' | 'prompt'>) => {
      state.locationPermission = action.payload
    },
    clearLocationError: (state) => {
      state.error = null
    },
    updateShopStatus: (state, action: PayloadAction<{ shopId: string; isOpen: boolean }>) => {
      const shop = state.availableShops.find(s => s.id === action.payload.shopId)
      if (shop) {
        shop.isOpen = action.payload.isOpen
      }
    },
    setSavedAddresses: (state, action: PayloadAction<Address[]>) => {
      state.savedAddresses = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.error = null
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        const { coords } = action.payload
        state.userLocation = {
          coordinates: {
            lat: coords.latitude,
            lng: coords.longitude
          },
          timestamp: Date.now()
        }
        state.locationPermission = 'granted'
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to get current location'
        state.locationPermission = 'denied'
      })
      
      .addCase(fetchNearbyShops.pending, (state) => {
        state.loadingShops = true
        state.error = null
      })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        state.availableShops = action.payload
        state.loadingShops = false
      })
      .addCase(fetchNearbyShops.rejected, (state, action) => {
        state.loadingShops = false
        state.error = action.error.message || 'Failed to fetch nearby shops'
      })
      
      .addCase(fetchShopsCountByRadius.fulfilled, (state, action) => {
        state.nearbyShopsCount = action.payload
      })
      
      .addCase(saveAddress.fulfilled, (state, action) => {
        state.savedAddresses.push(action.payload)
      })
      
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.savedAddresses = state.savedAddresses.filter(a => a.id !== action.payload)
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = null
        }
      })
      
      .addCase(geocodeAddress.fulfilled, (state, action) => {
        state.userLocation = {
          coordinates: action.payload.coordinates,
          address: action.payload.formattedAddress,
          timestamp: Date.now()
        }
      })
  }
})

export const {
  setUserLocation,
  setSelectedAddress,
  setSearchRadius,
  setLocationPermission,
  clearLocationError,
  updateShopStatus,
  setSavedAddresses
} = locationSlice.actions

export const selectUserLocation = (state: RootState) => state.location.userLocation
export const selectAvailableShops = (state: RootState) => state.location.availableShops
export const selectSearchRadius = (state: RootState) => state.location.searchRadius
export const selectNearbyShopsCount = (state: RootState) => state.location.nearbyShopsCount
export const selectSavedAddresses = (state: RootState) => state.location.savedAddresses
export const selectLocationPermission = (state: RootState) => state.location.locationPermission

export const selectShopById = (shopId: string) => (state: RootState) =>
  state.location.availableShops.find(shop => shop.id === shopId)

export const selectOpenShops = (state: RootState) =>
  state.location.availableShops.filter(shop => shop.isOpen)

export const selectShopsByCategory = (category: string) => (state: RootState) =>
  state.location.availableShops.filter(shop => shop.categories.includes(category))

export default locationSlice.reducer