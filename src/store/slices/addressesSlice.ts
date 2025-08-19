import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { addressesApi } from '@api/addressesApi'

export interface Address {
  id: string
  userId: string
  type: 'home' | 'work' | 'other'
  label?: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  latitude?: number
  longitude?: number
  fullAddress?: string
  createdAt: string
  updatedAt: string
}

interface AddressesState {
  addresses: Address[]
  selectedAddress: Address | null
  defaultAddress: Address | null
  loading: boolean
  error: string | null
}

const initialState: AddressesState = {
  addresses: [],
  selectedAddress: null,
  defaultAddress: null,
  loading: false,
  error: null
}

export const fetchUserAddresses = createAsyncThunk(
  'addresses/fetchUserAddresses',
  async () => {
    const addresses = await addressesApi.getAddresses()
    return addresses
  }
)

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload
      state.defaultAddress = action.payload.find(addr => addr.isDefault) || null
      state.loading = false
      state.error = null
    },
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload)
      if (action.payload.isDefault) {
        state.addresses.forEach(addr => {
          if (addr.id !== action.payload.id) {
            addr.isDefault = false
          }
        })
        state.defaultAddress = action.payload
      }
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id)
      if (index !== -1) {
        state.addresses[index] = action.payload
        if (action.payload.isDefault) {
          state.addresses.forEach(addr => {
            if (addr.id !== action.payload.id) {
              addr.isDefault = false
            }
          })
          state.defaultAddress = action.payload
        }
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      const removedAddress = state.addresses.find(addr => addr.id === action.payload)
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload)
      
      if (removedAddress?.isDefault && state.addresses.length > 0) {
        state.addresses[0].isDefault = true
        state.defaultAddress = state.addresses[0]
      } else if (removedAddress?.isDefault) {
        state.defaultAddress = null
      }
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses.forEach(addr => {
        addr.isDefault = addr.id === action.payload
      })
      state.defaultAddress = state.addresses.find(addr => addr.id === action.payload) || null
    },
    clearAddresses: (state) => {
      state.addresses = []
      state.selectedAddress = null
      state.defaultAddress = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload
        state.defaultAddress = action.payload.find(addr => addr.isDefault) || action.payload[0] || null
        state.selectedAddress = state.defaultAddress
        state.loading = false
        state.error = null
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch addresses'
      })
  }
})

export const {
  setAddresses,
  setSelectedAddress,
  setLoading,
  setError,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  clearAddresses
} = addressesSlice.actions

export default addressesSlice.reducer