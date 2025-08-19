import { apiClient } from './config'

// Admin Dashboard API
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

// Products API
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

// Shops API
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
  address: {
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
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active'
  isVerified: boolean
  rating: number
  reviewsCount: number
  productsCount: number
  ordersCount: number
  totalRevenue: number
  settings: {
    allowReviews: boolean
    showContactInfo: boolean
    autoAcceptOrders: boolean
    workingHours: {
      monday: { open: string; close: string; isOpen: boolean }
      tuesday: { open: string; close: string; isOpen: boolean }
      wednesday: { open: string; close: string; isOpen: boolean }
      thursday: { open: string; close: string; isOpen: boolean }
      friday: { open: string; close: string; isOpen: boolean }
      saturday: { open: string; close: string; isOpen: boolean }
      sunday: { open: string; close: string; isOpen: boolean }
    }
  }
  documents: {
    businessLicense?: string
    taxCertificate?: string
    bankDetails?: string
  }
  createdAt: string
  updatedAt: string
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

// Orders API
export interface Order {
  id: string
  orderNumber: string
  userId: string
  userName: string
  userEmail: string
  shopId: string
  shopName: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  shippingAddress: {
    fullName: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress: {
    fullName: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
  paymentDetails?: Record<string, any>
  notes?: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

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

// Categories API
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

// API methods
export const adminApi = {
  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> =>
    apiClient.get('/admin/dashboard/stats'),
  
  getRecentActivity: (limit: number = 10): Promise<RecentActivity[]> =>
    apiClient.get(`/admin/dashboard/activity?limit=${limit}`),
  
  getTopProducts: (limit: number = 5): Promise<TopProduct[]> =>
    apiClient.get(`/admin/dashboard/top-products?limit=${limit}`),
  
  getTopShops: (limit: number = 5): Promise<TopShop[]> =>
    apiClient.get(`/admin/dashboard/top-shops?limit=${limit}`),

  // Products
  getProducts: (filters: ProductFilters = {}): Promise<{ data: Product[]; total: number; page: number; limit: number }> =>
    apiClient.get('/admin/products', { params: filters }),
  
  getProduct: (id: string): Promise<Product> =>
    apiClient.get(`/admin/products/${id}`),
  
  createProduct: (data: ProductFormData): Promise<Product> =>
    apiClient.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateProduct: (id: string, data: Partial<ProductFormData>): Promise<Product> =>
    apiClient.put(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteProduct: (id: string): Promise<void> =>
    apiClient.delete(`/admin/products/${id}`),
  
  updateProductStatus: (id: string, status: string): Promise<Product> =>
    apiClient.patch(`/admin/products/${id}/status`, { status }),

  // Shops
  getShops: (filters: ShopFilters = {}): Promise<{ data: Shop[]; total: number; page: number; limit: number }> =>
    apiClient.get('/admin/shops', { params: filters }),
  
  getShop: (id: string): Promise<Shop> =>
    apiClient.get(`/admin/shops/${id}`),
  
  updateShopStatus: (id: string, status: string): Promise<Shop> =>
    apiClient.patch(`/admin/shops/${id}/status`, { status }),
  
  verifyShop: (id: string): Promise<Shop> =>
    apiClient.patch(`/admin/shops/${id}/verify`),
  
  suspendShop: (id: string, reason: string): Promise<Shop> =>
    apiClient.patch(`/admin/shops/${id}/suspend`, { reason }),

  // Orders
  getOrders: (filters: OrderFilters = {}): Promise<{ data: Order[]; total: number; page: number; limit: number }> =>
    apiClient.get('/admin/orders', { params: filters }),
  
  getOrder: (id: string): Promise<Order> =>
    apiClient.get(`/admin/orders/${id}`),
  
  updateOrderStatus: (id: string, status: string, notes?: string): Promise<Order> =>
    apiClient.patch(`/admin/orders/${id}/status`, { status, notes }),
  
  updatePaymentStatus: (id: string, paymentStatus: string): Promise<Order> =>
    apiClient.patch(`/admin/orders/${id}/payment-status`, { paymentStatus }),
  
  addTrackingNumber: (id: string, trackingNumber: string): Promise<Order> =>
    apiClient.patch(`/admin/orders/${id}/tracking`, { trackingNumber }),

  // Categories
  getCategories: (includeInactive: boolean = false): Promise<Category[]> =>
    apiClient.get(`/admin/categories?includeInactive=${includeInactive}`),
  
  getCategory: (id: string): Promise<Category> =>
    apiClient.get(`/admin/categories/${id}`),
  
  createCategory: (data: CategoryFormData): Promise<Category> =>
    apiClient.post('/admin/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateCategory: (id: string, data: Partial<CategoryFormData>): Promise<Category> =>
    apiClient.put(`/admin/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/admin/categories/${id}`),
  
  reorderCategories: (categories: { id: string; sortOrder: number }[]): Promise<void> =>
    apiClient.patch('/admin/categories/reorder', { categories }),

  // Reports
  getReportsData: (type: 'sales' | 'products' | 'shops' | 'users', period: 'day' | 'week' | 'month' | 'year'): Promise<any> =>
    apiClient.get(`/admin/reports/${type}?period=${period}`),
  
  exportReport: (type: string, format: 'csv' | 'xlsx', filters: any = {}): Promise<Blob> =>
    apiClient.get(`/admin/reports/${type}/export?format=${format}`, { 
      params: filters,
      responseType: 'blob'
    })
}