// Admin Dashboard Types
export interface DashboardStats {
  totalUsers: number
  totalShops: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  activeUsers: number
  newUsersToday: number
}

export interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'shop' | 'product'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export interface TopProduct {
  id: string
  name: string
  image: string
  sales: number
  revenue: number
  category: string
}

export interface TopShop {
  id: string
  name: string
  logo: string
  orders: number
  revenue: number
  rating: number
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: string
  categoryId: string
  shopId: string
  shopName: string
  stock: number
  sku: string
  status: 'active' | 'inactive' | 'draft' | 'out_of_stock'
  rating: number
  reviewsCount: number
  tags: string[]
  specifications: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search?: string
  category?: string
  shop?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  discountPrice?: number
  categoryId: string
  stock: number
  sku: string
  status: string
  tags: string[]
  specifications: Record<string, any>
  images: File[]
}

// Shop Types
export interface Shop {
  id: string
  name: string
  description: string
  logo: string
  banner: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  phone: string
  email: string
  address: ShopAddress
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active'
  isVerified: boolean
  rating: number
  reviewsCount: number
  productsCount: number
  ordersCount: number
  totalRevenue: number
  settings: ShopSettings
  documents: ShopDocuments
  createdAt: string
  updatedAt: string
}

export interface ShopAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface ShopSettings {
  allowReviews: boolean
  showContactInfo: boolean
  autoAcceptOrders: boolean
  workingHours: {
    monday: WorkingDay
    tuesday: WorkingDay
    wednesday: WorkingDay
    thursday: WorkingDay
    friday: WorkingDay
    saturday: WorkingDay
    sunday: WorkingDay
  }
}

export interface WorkingDay {
  open: string
  close: string
  isOpen: boolean
}

export interface ShopDocuments {
  businessLicense?: string
  taxCertificate?: string
  bankDetails?: string
}

export interface ShopFilters {
  search?: string
  status?: string
  isVerified?: boolean
  minRating?: number
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'rating' | 'revenue'
  sortOrder?: 'asc' | 'desc'
}

// Order Types
export interface Order {
  id: string
  orderNumber: string
  userId: string
  userName: string
  userEmail: string
  shopId: string
  shopName: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  paymentDetails?: Record<string, any>
  notes?: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  total: number
  specifications?: Record<string, any>
}

export interface Address {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderFilters {
  search?: string
  status?: string
  paymentStatus?: string
  shopId?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  sortBy?: 'orderNumber' | 'createdAt' | 'totalAmount' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// Category Types
export interface Category {
  id: string
  name: string
  description: string
  slug: string
  image?: string
  icon?: string
  parentId?: string
  parentName?: string
  level: number
  isActive: boolean
  sortOrder: number
  productsCount: number
  children?: Category[]
  metadata?: Record<string, any>
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  createdAt: string
  updatedAt: string
}

export interface CategoryFormData {
  name: string
  description: string
  slug: string
  image?: File
  icon?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  metadata?: Record<string, any>
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

// User Types for Admin
export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: 'admin' | 'user' | 'shop_owner' | 'moderator'
  status: 'active' | 'inactive' | 'banned' | 'pending'
  isVerified: boolean
  lastLoginAt?: string
  joinedAt: string
  profile?: {
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other'
    address?: Address
    preferences?: Record<string, any>
  }
  stats?: {
    ordersCount: number
    totalSpent: number
    averageOrderValue: number
    shopId?: string
  }
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  search?: string
  role?: string
  status?: string
  isVerified?: boolean
  page?: number
  limit?: number
  sortBy?: 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
}

// Report Types
export interface ReportData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface SalesReport {
  period: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  growth: number
  data: ReportData
}

export interface ProductReport {
  period: string
  totalProducts: number
  newProducts: number
  outOfStock: number
  topCategories: { name: string; count: number }[]
  data: ReportData
}

// Pagination
export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface ApiError {
  message: string
  code: string
  details?: any
}