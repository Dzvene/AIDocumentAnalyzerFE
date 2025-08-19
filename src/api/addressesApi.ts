import { apiClient } from './config'

interface Address {
  id: string
  userId: string
  type: 'home' | 'work' | 'other'
  label?: string // Например: "Дом", "Офис", "Родители"
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
  fullAddress?: string // Полный адрес одной строкой
  createdAt: string
  updatedAt: string
}

interface CreateAddressRequest {
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
  isDefault?: boolean
  latitude?: number
  longitude?: number
}

interface UpdateAddressRequest {
  type?: 'home' | 'work' | 'other'
  firstName?: string
  lastName?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  phone?: string
  isDefault?: boolean
}

interface AddressValidationRequest {
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface AddressValidationResponse {
  isValid: boolean
  suggestions?: Address[]
  correctedAddress?: Partial<Address>
  confidence?: number
  errors?: string[]
}

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  states?: string[]
  cities?: string[]
  postalCodes?: string[]
  shippingMethods: Array<{
    id: string
    name: string
    estimatedDays: string
    price: number
  }>
}

export const addressesApi = {
  // Maximum addresses per user
  MAX_ADDRESSES: 10,

  // Get addresses
  getAddresses: async (): Promise<Address[]> => {
    return apiClient.get<Address[]>('/addresses')
  },

  getUserAddresses: async (userId: string): Promise<Address[]> => {
    return apiClient.get<Address[]>(`/users/${userId}/addresses`)
  },
  
  // Check if user can add more addresses
  canAddAddress: async (userId: string): Promise<boolean> => {
    const addresses = await apiClient.get<Address[]>(`/users/${userId}/addresses`)
    return addresses.length < addressesApi.MAX_ADDRESSES
  },

  getAddressById: async (id: string): Promise<Address> => {
    return apiClient.get<Address>(`/addresses/${id}`)
  },

  getDefaultAddress: async (): Promise<Address | null> => {
    return apiClient.get<Address | null>('/addresses/default')
  },

  // Create address
  createAddress: async (data: CreateAddressRequest): Promise<Address> => {
    return apiClient.post<Address>('/addresses', data)
  },

  // Update address
  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
    return apiClient.patch<Address>(`/addresses/${id}`, data)
  },

  // Delete address
  deleteAddress: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/addresses/${id}`)
  },

  // Set default address
  setDefaultAddress: async (id: string): Promise<Address> => {
    return apiClient.patch<Address>(`/addresses/${id}/default`)
  },

  // Address validation
  validateAddress: async (data: AddressValidationRequest): Promise<AddressValidationResponse> => {
    return apiClient.post<AddressValidationResponse>('/addresses/validate', data)
  },

  // Auto-complete address
  searchAddresses: async (query: string, country?: string): Promise<Array<{
    description: string
    place_id: string
    structured_formatting: {
      main_text: string
      secondary_text: string
    }
  }>> => {
    return apiClient.get<Array<{
      description: string
      place_id: string
      structured_formatting: {
        main_text: string
        secondary_text: string
      }
    }>>('/addresses/search', {
      params: { query, country }
    })
  },

  getAddressDetails: async (placeId: string): Promise<{
    address1: string
    city: string
    state: string
    postalCode: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }> => {
    return apiClient.get<{
      address1: string
      city: string
      state: string
      postalCode: string
      country: string
      coordinates?: {
        lat: number
        lng: number
      }
    }>(`/addresses/details/${placeId}`)
  },

  // Shipping zones and methods
  getShippingZones: async (): Promise<ShippingZone[]> => {
    return apiClient.get<ShippingZone[]>('/shipping/zones')
  },

  getShippingMethodsForAddress: async (addressId: string): Promise<Array<{
    id: string
    name: string
    description?: string
    estimatedDays: string
    price: number
    carrier?: string
    trackingAvailable: boolean
  }>> => {
    return apiClient.get<Array<{
      id: string
      name: string
      description?: string
      estimatedDays: string
      price: number
      carrier?: string
      trackingAvailable: boolean
    }>>(`/addresses/${addressId}/shipping-methods`)
  },

  calculateShippingCost: async (params: {
    addressId: string
    items: Array<{
      productId: string
      quantity: number
      weight?: number
      dimensions?: {
        length: number
        width: number
        height: number
      }
    }>
    shippingMethodId?: string
  }): Promise<{
    methods: Array<{
      id: string
      name: string
      price: number
      estimatedDays: string
      carrier?: string
    }>
    defaultMethodId: string
  }> => {
    return apiClient.post<{
      methods: Array<{
        id: string
        name: string
        price: number
        estimatedDays: string
        carrier?: string
      }>
      defaultMethodId: string
    }>('/shipping/calculate', params)
  },

  // Distance calculation
  calculateDistance: async (from: string, to: string): Promise<{
    distance: number
    duration: number
    unit: 'km' | 'miles'
  }> => {
    return apiClient.post<{
      distance: number
      duration: number
      unit: 'km' | 'miles'
    }>('/addresses/distance', { from, to })
  },

  // Bulk operations
  bulkCreateAddresses: async (addresses: CreateAddressRequest[]): Promise<{
    created: Address[]
    errors: Array<{
      index: number
      error: string
    }>
  }> => {
    return apiClient.post<{
      created: Address[]
      errors: Array<{
        index: number
        error: string
      }>
    }>('/addresses/bulk', { addresses })
  },

  bulkDeleteAddresses: async (addressIds: string[]): Promise<{
    message: string
    deletedCount: number
  }> => {
    return apiClient.post<{
      message: string
      deletedCount: number
    }>('/addresses/bulk-delete', { addressIds })
  },

  // Admin endpoints
  adminGetAllAddresses: async (params?: {
    page?: number
    limit?: number
    search?: string
    country?: string
    userId?: string
  }): Promise<{
    addresses: Address[]
    total: number
    page: number
    totalPages: number
  }> => {
    return apiClient.get<{
      addresses: Address[]
      total: number
      page: number
      totalPages: number
    }>('/admin/addresses', { params })
  },

  // Import/Export
  exportAddresses: async (format: 'csv' | 'json' | 'xlsx'): Promise<Blob> => {
    return apiClient.get<Blob>(`/addresses/export?format=${format}`, {
      responseType: 'blob'
    })
  },

  importAddresses: async (file: File): Promise<{
    imported: number
    errors: Array<{
      row: number
      error: string
    }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<{
      imported: number
      errors: Array<{
        row: number
        error: string
      }>
    }>('/addresses/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}