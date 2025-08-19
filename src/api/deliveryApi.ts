import axios from 'axios'
import { 
  DeliveryType, 
  DeliveryTimeSlot, 
  PickupPoint, 
  Courier, 
  ThirdPartyService,
  DeliveryAddress,
  DeliveryOption
} from '@store/slices/deliverySlice'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

export interface DeliveryOptionsParams {
  shopId: string
  addressId: string
  orderAmount?: number
}

export interface DeliveryOptionsResponse {
  options: DeliveryOption[]
  defaultOption?: DeliveryType
  restrictions?: {
    minOrderAmount?: number
    maxDistance?: number
    workingHours?: {
      start: string
      end: string
    }
  }
}

export interface CouriersParams {
  shopId: string
  addressId: string
  vehicleType?: 'all' | 'bicycle' | 'scooter' | 'car' | 'walking'
  minRating?: number
  maxPrice?: number
}

export interface CouriersResponse {
  couriers: Courier[]
  totalCount: number
  averagePrice: number
  fastestTime: string
}

export interface ThirdPartyServicesParams {
  shopId: string
  addressId: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export interface CalculateDeliveryRequest {
  shopId: string
  addressId: string
  type: DeliveryType
  items?: {
    id: string
    quantity: number
    weight?: number
  }[]
  urgency?: 'standard' | 'express' | 'scheduled'
  scheduledTime?: string
}

export interface CalculateDeliveryResponse {
  amount: number
  currency: string
  breakdown: {
    base: number
    distance: number
    weight?: number
    urgency?: number
    discount?: number
  }
  estimatedTime: string
  validUntil: string
}

export interface TimeSlotsParams {
  shopId: string
  type: DeliveryType
  date: string
  addressId?: string
}

export interface BookCourierRequest {
  shopId: string
  courierId: string
  timeSlotId: string
  addressId: string
  instructions?: string
  contactPhone?: string
}

export interface BookCourierResponse {
  bookingId: string
  courier: Courier
  estimatedArrival: string
  trackingUrl?: string
  contactPhone: string
}

export interface MarketplaceDeliveryCheckRequest {
  shopIds: string[]
  addressId: string
  preferredTime?: string
}

export interface MarketplaceDeliveryCheckResponse {
  available: boolean
  price: number
  estimatedTime: string
  drivers: number
  canCombineOrders: boolean
  savings?: number
}

export interface TrackDeliveryResponse {
  orderId: string
  status: 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
  currentLocation?: {
    lat: number
    lng: number
  }
  courier?: {
    name: string
    phone: string
    photo?: string
  }
  estimatedArrival: string
  updates: {
    timestamp: string
    status: string
    message: string
  }[]
}

export interface SchedulePickupRequest {
  shopId: string
  pickupPointId: string
  date: string
  timeSlot: string
  customerName: string
  customerPhone: string
}

export interface SchedulePickupResponse {
  confirmationCode: string
  pickupPoint: PickupPoint
  scheduledTime: string
  qrCode?: string
  instructions?: string
}

class DeliveryApi {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async getDeliveryOptions(params: DeliveryOptionsParams): Promise<DeliveryOptionsResponse> {
    const { data } = await this.axiosInstance.get(
      `/shops/${params.shopId}/delivery-options`,
      { params: { addressId: params.addressId, orderAmount: params.orderAmount } }
    )
    return data
  }

  async getPickupPoints(shopId: string): Promise<PickupPoint[]> {
    const { data } = await this.axiosInstance.get(`/shops/${shopId}/pickup-points`)
    return data
  }

  async getAvailableCouriers(params: CouriersParams): Promise<CouriersResponse> {
    const { data } = await this.axiosInstance.get('/delivery/couriers', { params })
    return data
  }

  async getThirdPartyServices(params: ThirdPartyServicesParams): Promise<ThirdPartyService[]> {
    const { data } = await this.axiosInstance.get('/delivery/third-party', { params })
    return data
  }

  async calculateDeliveryCost(request: CalculateDeliveryRequest): Promise<CalculateDeliveryResponse> {
    const { data } = await this.axiosInstance.post('/delivery/calculate', request)
    return data
  }

  async getTimeSlots(params: TimeSlotsParams): Promise<DeliveryTimeSlot[]> {
    const { data } = await this.axiosInstance.get('/delivery/time-slots', { params })
    return data
  }

  async bookCourier(request: BookCourierRequest): Promise<BookCourierResponse> {
    const { data } = await this.axiosInstance.post('/delivery/book-courier', request)
    return data
  }

  async cancelCourierBooking(bookingId: string, reason?: string): Promise<void> {
    await this.axiosInstance.post(`/delivery/bookings/${bookingId}/cancel`, { reason })
  }

  async checkMarketplaceDelivery(
    request: MarketplaceDeliveryCheckRequest
  ): Promise<MarketplaceDeliveryCheckResponse> {
    const { data } = await this.axiosInstance.post('/delivery/marketplace/check', request)
    return data
  }

  async bookMarketplaceDelivery(
    shopIds: string[],
    addressId: string,
    timeSlotId: string
  ): Promise<{
    bookingId: string
    deliveries: {
      shopId: string
      estimatedTime: string
    }[]
    totalCost: number
  }> {
    const { data } = await this.axiosInstance.post('/delivery/marketplace/book', {
      shopIds,
      addressId,
      timeSlotId
    })
    return data
  }

  async trackDelivery(orderId: string): Promise<TrackDeliveryResponse> {
    const { data } = await this.axiosInstance.get(`/delivery/track/${orderId}`)
    return data
  }

  async schedulePickup(request: SchedulePickupRequest): Promise<SchedulePickupResponse> {
    const { data } = await this.axiosInstance.post('/delivery/schedule-pickup', request)
    return data
  }

  async cancelPickup(confirmationCode: string, reason?: string): Promise<void> {
    await this.axiosInstance.post('/delivery/cancel-pickup', {
      confirmationCode,
      reason
    })
  }

  async rateDelivery(
    orderId: string,
    rating: number,
    comment?: string,
    courierRating?: number
  ): Promise<void> {
    await this.axiosInstance.post(`/delivery/rate/${orderId}`, {
      rating,
      comment,
      courierRating
    })
  }

  async reportDeliveryIssue(
    orderId: string,
    issueType: 'late' | 'wrong_order' | 'damaged' | 'not_delivered' | 'other',
    description: string,
    photos?: File[]
  ): Promise<{
    ticketId: string
    status: string
  }> {
    const formData = new FormData()
    formData.append('issueType', issueType)
    formData.append('description', description)
    
    if (photos) {
      photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo)
      })
    }

    const { data } = await this.axiosInstance.post(
      `/delivery/report-issue/${orderId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return data
  }

  async getDeliveryHistory(
    page = 1,
    limit = 10
  ): Promise<{
    deliveries: {
      orderId: string
      shopName: string
      deliveryType: DeliveryType
      deliveredAt: string
      cost: number
      rating?: number
    }[]
    total: number
    page: number
    totalPages: number
  }> {
    const { data } = await this.axiosInstance.get('/delivery/history', {
      params: { page, limit }
    })
    return data
  }

  async saveDeliveryPreferences(preferences: {
    defaultType?: DeliveryType
    defaultAddressId?: string
    preferredTimeSlots?: string[]
    specialInstructions?: string
  }): Promise<void> {
    await this.axiosInstance.post('/delivery/preferences', preferences)
  }

  async getDeliveryPreferences(): Promise<{
    defaultType?: DeliveryType
    defaultAddressId?: string
    preferredTimeSlots?: string[]
    specialInstructions?: string
  }> {
    const { data } = await this.axiosInstance.get('/delivery/preferences')
    return data
  }
}

export const deliveryApi = new DeliveryApi()