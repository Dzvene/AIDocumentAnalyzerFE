# Backend Integration Map
## Полная карта соответствия Frontend ↔ Backend

### 📊 Статус интеграции модулей

| Backend Module | Frontend Module | API Status | Integration Status |
|----------------|-----------------|------------|-------------------|
| **Auth** | authApi.ts | ✅ Fully Ready | 🔄 Needs Update |
| **Users** | usersApi.ts | ✅ Fully Ready | 🔄 Needs Update |
| **Vendors** | vendorsApi.ts | ✅ Fully Ready | 🔄 Needs Update |
| **Roles** | rolesApi.ts | ✅ Fully Ready | ❌ Not Created |
| **Advertisement** | advertisingSlice.ts | ✅ Fully Ready | 🔄 Needs Update |
| **Billing** | paymentsApi.ts | ✅ Fully Ready | 🔄 Needs Update |
| **Cart** | multiCartApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Products** | productsApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Orders** | ordersApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Delivery** | deliveryApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Geolocation** | geolocationApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **ShoppingList** | shoppingListApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Reviews** | reviewsApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Search** | searchApi.ts | ⚠️ Models Only | ❌ No Controllers |
| **Notifications** | - | ⚠️ Models Only | ❌ Not Created |
| **Cities** | - | ✅ Basic Ready | ❌ Not Created |
| **Email** | - | ✅ Service Ready | N/A (Backend only) |

## 🔐 Authentication Integration

### Backend Endpoints:
```
POST /api/auth-module/register
POST /api/auth-module/login
POST /api/auth-module/refresh
POST /api/auth-module/logout
GET  /api/auth-module/me
```

### Frontend Updates Required:
```typescript
// authApi.ts должен использовать:
baseURL: 'http://localhost:5050'
endpoints: {
  register: '/api/auth-module/register',
  login: '/api/auth-module/login',
  refresh: '/api/auth-module/refresh',
  logout: '/api/auth-module/logout',
  me: '/api/auth-module/me'
}
```

### JWT Token Structure:
```typescript
interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    userInfo: {
      id: string
      email: string
      userName: string
      firstName: string
      lastName: string
      phoneNumber: string
      emailConfirmed: boolean
      twoFactorEnabled: boolean
      roles: string[]
    }
  }
}
```

## 🏪 Vendors Integration

### Backend Endpoints:
```
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/{id}
PUT    /api/vendors/{id}
DELETE /api/vendors/{id}
GET    /api/vendors/my-vendor
```

### Vendor DTO Structure:
```typescript
interface VendorDto {
  id: string
  userId: string
  businessName: string
  description: string
  email: string
  phoneNumber: string
  website?: string
  logoUrl?: string
  bannerUrl?: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    latitude?: number
    longitude?: number
  }
  businessHours: {
    [day: string]: {
      open: string
      close: string
      isClosed: boolean
    }
  }
  isVerified: boolean
  verificationDate?: string
  rating: number
  totalReviews: number
  totalProducts: number
  commission: number
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending'
  createdAt: string
  updatedAt: string
  
  // Геолокационные поля для нашей модели
  deliveryRadius: number
  deliveryOptions: {
    ownDelivery: boolean
    thirdPartyDelivery: boolean
    courierDelivery: boolean
    selfPickup: boolean
    marketplaceDelivery: boolean
  }
  minOrderAmount: number
  averageDeliveryTime: string
  deliveryFee: number
}
```

## 📢 Advertisement Integration

### Backend Endpoints:
```
GET    /api/advertisement/campaigns
POST   /api/advertisement/campaigns
GET    /api/advertisement/campaigns/{id}
PUT    /api/advertisement/campaigns/{id}
DELETE /api/advertisement/campaigns/{id}
GET    /api/advertisement/active-ads
POST   /api/advertisement/track-click
POST   /api/advertisement/track-impression
```

### Advertisement Campaign Model:
```typescript
interface AdCampaign {
  id: string
  vendorId: string
  name: string
  type: 'Banner' | 'Featured' | 'Sponsored' | 'PremiumSlider'
  targetAudience: {
    location?: {
      latitude: number
      longitude: number
      radius: number
    }
    ageRange?: {
      min: number
      max: number
    }
    interests?: string[]
  }
  budget: number
  dailyBudget?: number
  startDate: string
  endDate: string
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'
  performance: {
    impressions: number
    clicks: number
    ctr: number
    spent: number
    conversions: number
  }
  creativeContent: {
    title: string
    description: string
    imageUrl?: string
    ctaText?: string
    ctaUrl?: string
  }
}
```

## 👥 Roles & Permissions (RBAC)

### Backend Endpoints:
```
GET    /api/roles
POST   /api/roles
GET    /api/roles/{id}
PUT    /api/roles/{id}
DELETE /api/roles/{id}
GET    /api/rolepermissions
POST   /api/rolepermissions
```

### Permission System:
```typescript
interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean
}

interface Permission {
  id: string
  name: string
  category: string
  description: string
}

// 290+ permissions available in system
enum PermissionCategories {
  USER_MANAGEMENT = 'User Management',
  VENDOR_MANAGEMENT = 'Vendor Management',
  PRODUCT_MANAGEMENT = 'Product Management',
  ORDER_MANAGEMENT = 'Order Management',
  BILLING = 'Billing',
  REPORTS = 'Reports',
  SETTINGS = 'Settings'
}
```

## 🔄 Required API Updates

### 1. Update axios configuration:
```typescript
// src/api/config.ts
import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// JWT Token interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Refresh token interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_BASE_URL}/api/auth-module/refresh`, {
          refreshToken
        })
        
        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
```

### 2. Standardized API Response Handler:
```typescript
// src/api/responseHandler.ts
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
}

export const handleApiResponse = async <T>(
  promise: Promise<any>
): Promise<T> => {
  try {
    const response = await promise
    const apiResponse: ApiResponse<T> = response.data
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed')
    }
    
    return apiResponse.data as T
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors.join(', '))
    }
    throw error
  }
}
```

## 🚧 Missing Backend Controllers (Need Implementation)

The following modules have models but no controllers yet:

### Priority 1 (Core Functionality):
1. **Cart Controller** - Shopping cart management
2. **Products Controller** - Product catalog
3. **Orders Controller** - Order processing
4. **Geolocation Controller** - Location-based services

### Priority 2 (Enhanced Features):
5. **Delivery Controller** - Delivery management
6. **ShoppingList Controller** - Smart shopping lists
7. **Search Controller** - Search functionality
8. **Reviews Controller** - Rating system

### Priority 3 (Additional):
9. **Notifications Controller** - Push notifications
10. **Cities Controller** - City/location management

## 📝 Next Steps

### Immediate Actions:
1. ✅ Update `authApi.ts` to match backend endpoints
2. ✅ Update `vendorsApi.ts` for vendor management
3. ✅ Create `rolesApi.ts` for RBAC
4. ✅ Create `advertisementApi.ts` for ad campaigns
5. ✅ Configure axios interceptors for JWT

### Backend Requirements:
1. ⚠️ Implement Cart Controller with multi-cart support
2. ⚠️ Implement Products Controller with geolocation filtering
3. ⚠️ Implement Orders Controller with delivery options
4. ⚠️ Implement Geolocation Controller for radius search

### Testing Strategy:
1. Test authentication flow (register → login → refresh → logout)
2. Test vendor registration and management
3. Test role-based access control
4. Test advertisement creation and tracking
5. Test geolocation-based shop discovery

## 🔗 Environment Variables

```env
# .env
REACT_APP_API_URL=http://localhost:5050
REACT_APP_ENABLE_SWAGGER=true
REACT_APP_JWT_STORAGE=localStorage
REACT_APP_DEFAULT_RADIUS=5
REACT_APP_MAX_RADIUS=20
```

## 🎯 Integration Checklist

- [ ] Configure axios with JWT interceptors
- [ ] Update all API endpoints to match backend
- [ ] Create TypeScript types from DTOs
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Setup refresh token rotation
- [ ] Configure CORS properly
- [ ] Add API response caching
- [ ] Implement retry logic
- [ ] Add request/response logging