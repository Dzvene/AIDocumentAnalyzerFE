import axios from 'axios'
import { Coordinates, Shop, SearchRadius, Address } from '@store/slices/locationSlice'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

export interface NearbyShopsParams {
  lat: number
  lng: number
  radius: SearchRadius
  categories?: string[]
  tags?: string[]
  isOpen?: boolean
  minRating?: number
  maxDeliveryFee?: number
  sortBy?: 'distance' | 'rating' | 'deliveryFee' | 'deliveryTime'
}

export interface NearbyShopsResponse {
  shops: Shop[]
  totalCount: number
  radius: number
  userLocation: {
    lat: number
    lng: number
    address?: string
  }
}

export interface ShopAvailabilityResponse {
  available: boolean
  distance: number
  estimatedDeliveryTime: string
  deliveryFee: number
  minOrderAmount: number
  reasons?: string[]
}

export interface GeocodeResponse {
  coordinates: Coordinates
  formattedAddress: string
  street: string
  city: string
  postalCode: string
  country: string
  placeId?: string
}

export interface ReverseGeocodeResponse {
  address: string
  street: string
  city: string
  postalCode: string
  country: string
  placeId?: string
}

export interface ShopsCountResponse {
  radius: number
  count: number
  categories: {
    [category: string]: number
  }
}

export interface DistanceMatrixRequest {
  origins: Coordinates[]
  destinations: Coordinates[]
  mode?: 'driving' | 'walking' | 'bicycling'
}

export interface DistanceMatrixResponse {
  distances: {
    origin: Coordinates
    destination: Coordinates
    distance: number
    duration: number
    durationText: string
    distanceText: string
  }[]
}

class GeolocationApi {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async getNearbyShops(params: NearbyShopsParams): Promise<NearbyShopsResponse> {
    const { data } = await this.axiosInstance.get('/shops/nearby', { params })
    return data
  }

  async getShopsCountByRadius(coordinates: Coordinates): Promise<{ [K in SearchRadius]: number }> {
    const radiuses: SearchRadius[] = [2, 5, 10, 15, 20]
    const counts: { [K in SearchRadius]: number } = {} as any
    
    await Promise.all(
      radiuses.map(async (radius) => {
        const { data } = await this.axiosInstance.get<ShopsCountResponse>('/shops/count', {
          params: { lat: coordinates.lat, lng: coordinates.lng, radius }
        })
        counts[radius] = data.count
      })
    )
    
    return counts
  }

  async checkShopAvailability(
    shopId: string, 
    coordinates: Coordinates
  ): Promise<ShopAvailabilityResponse> {
    const { data } = await this.axiosInstance.get(`/shops/${shopId}/availability`, {
      params: { lat: coordinates.lat, lng: coordinates.lng }
    })
    return data
  }

  async geocodeAddress(address: string): Promise<GeocodeResponse> {
    const { data } = await this.axiosInstance.post('/geocode', { address })
    return data
  }

  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodeResponse> {
    const { data } = await this.axiosInstance.post('/reverse-geocode', coordinates)
    return data
  }

  async getDistanceMatrix(request: DistanceMatrixRequest): Promise<DistanceMatrixResponse> {
    const { data } = await this.axiosInstance.post('/distance-matrix', request)
    return data
  }

  async saveUserAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const { data } = await this.axiosInstance.post('/user/addresses', address)
    return data
  }

  async getUserAddresses(): Promise<Address[]> {
    const { data } = await this.axiosInstance.get('/user/addresses')
    return data
  }

  async updateUserAddress(id: string, address: Partial<Address>): Promise<Address> {
    const { data } = await this.axiosInstance.put(`/user/addresses/${id}`, address)
    return data
  }

  async deleteUserAddress(id: string): Promise<void> {
    await this.axiosInstance.delete(`/user/addresses/${id}`)
  }

  async setDefaultAddress(id: string): Promise<void> {
    await this.axiosInstance.post(`/user/addresses/${id}/set-default`)
  }

  async validateAddress(address: Partial<Address>): Promise<{
    valid: boolean
    suggestions?: Address[]
    errors?: string[]
  }> {
    const { data } = await this.axiosInstance.post('/addresses/validate', address)
    return data
  }

  async getServiceArea(): Promise<{
    areas: {
      name: string
      coordinates: Coordinates[]
      active: boolean
    }[]
  }> {
    const { data } = await this.axiosInstance.get('/service-area')
    return data
  }

  async checkServiceAvailability(coordinates: Coordinates): Promise<{
    available: boolean
    nearestArea?: string
    distance?: number
  }> {
    const { data } = await this.axiosInstance.get('/service-area/check', {
      params: { lat: coordinates.lat, lng: coordinates.lng }
    })
    return data
  }

  async getPopularLocations(): Promise<{
    locations: {
      name: string
      coordinates: Coordinates
      shopsCount: number
    }[]
  }> {
    const { data } = await this.axiosInstance.get('/locations/popular')
    return data
  }

  async searchLocations(query: string): Promise<{
    results: {
      name: string
      description: string
      coordinates: Coordinates
      type: 'address' | 'landmark' | 'area'
    }[]
  }> {
    const { data } = await this.axiosInstance.get('/locations/search', {
      params: { q: query }
    })
    return data
  }
}

export const geolocationApi = new GeolocationApi()