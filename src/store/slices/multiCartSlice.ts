import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  unit: string
  maxQuantity?: number
  discount?: number
  finalPrice: number
}

export interface ShopBasicInfo {
  id: string
  name: string
  logo?: string
  minOrderAmount: number
  deliveryFee: number
  estimatedDeliveryTime: string
  rating: number
  address: string
}

export interface ShopCart {
  shopId: string
  shopInfo: ShopBasicInfo
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  isValid: boolean
  validationErrors: string[]
  createdAt: number
  updatedAt: number
}

interface MultiCartState {
  carts: {
    [shopId: string]: ShopCart
  }
  activeCartId: string | null
  totalCartsCount: number
  totalItemsCount: number
  totalAmount: number
  loading: boolean
  error: string | null
  lastSyncTime: number | null
}

const initialState: MultiCartState = {
  carts: {},
  activeCartId: null,
  totalCartsCount: 0,
  totalItemsCount: 0,
  totalAmount: 0,
  loading: false,
  error: null,
  lastSyncTime: null
}

const calculateCartTotals = (cart: ShopCart): ShopCart => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
  const total = subtotal + cart.deliveryFee - cart.discount
  const isValid = subtotal >= cart.shopInfo.minOrderAmount
  const validationErrors = []
  
  if (!isValid) {
    validationErrors.push(`Минимальная сумма заказа: €${cart.shopInfo.minOrderAmount}`)
  }
  
  return {
    ...cart,
    subtotal,
    total,
    isValid,
    validationErrors,
    updatedAt: Date.now()
  }
}

export const fetchAllCarts = createAsyncThunk(
  'multiCart/fetchAll',
  async () => {
    const response = await fetch('/api/carts/all')
    if (!response.ok) {
      throw new Error('Failed to fetch carts')
    }
    return response.json()
  }
)

export const addToShopCart = createAsyncThunk(
  'multiCart/addItem',
  async ({ shopId, item }: { shopId: string; item: CartItem }) => {
    const response = await fetch(`/api/carts/${shopId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    if (!response.ok) {
      throw new Error('Failed to add item to cart')
    }
    return response.json()
  }
)

export const updateCartItem = createAsyncThunk(
  'multiCart/updateItem',
  async ({ shopId, itemId, quantity }: { shopId: string; itemId: string; quantity: number }) => {
    const response = await fetch(`/api/carts/${shopId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    })
    if (!response.ok) {
      throw new Error('Failed to update cart item')
    }
    return response.json()
  }
)

export const removeFromCart = createAsyncThunk(
  'multiCart/removeItem',
  async ({ shopId, itemId }: { shopId: string; itemId: string }) => {
    const response = await fetch(`/api/carts/${shopId}/items/${itemId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to remove item from cart')
    }
    return { shopId, itemId }
  }
)

export const clearShopCart = createAsyncThunk(
  'multiCart/clearCart',
  async (shopId: string) => {
    const response = await fetch(`/api/carts/${shopId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to clear cart')
    }
    return shopId
  }
)

export const syncCartsWithServer = createAsyncThunk(
  'multiCart/sync',
  async (_, { getState }) => {
    const state = getState() as RootState
    const response = await fetch('/api/carts/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.multiCart.carts)
    })
    if (!response.ok) {
      throw new Error('Failed to sync carts')
    }
    return response.json()
  }
)

export const checkoutShopCart = createAsyncThunk(
  'multiCart/checkout',
  async ({ shopId, deliveryInfo }: { shopId: string; deliveryInfo: any }) => {
    const response = await fetch(`/api/carts/${shopId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveryInfo)
    })
    if (!response.ok) {
      throw new Error('Failed to checkout cart')
    }
    return response.json()
  }
)

const multiCartSlice = createSlice({
  name: 'multiCart',
  initialState,
  reducers: {
    createOrUpdateCart: (state, action: PayloadAction<{ shopId: string; shopInfo: ShopBasicInfo }>) => {
      const { shopId, shopInfo } = action.payload
      if (!state.carts[shopId]) {
        state.carts[shopId] = {
          shopId,
          shopInfo,
          items: [],
          subtotal: 0,
          deliveryFee: shopInfo.deliveryFee,
          discount: 0,
          total: shopInfo.deliveryFee,
          isValid: false,
          validationErrors: [`Минимальная сумма заказа: €${shopInfo.minOrderAmount}`],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        state.totalCartsCount++
      }
    },
    
    addItemToCart: (state, action: PayloadAction<{ shopId: string; item: CartItem }>) => {
      const { shopId, item } = action.payload
      const cart = state.carts[shopId]
      
      if (cart) {
        const existingItem = cart.items.find(i => i.productId === item.productId)
        
        if (existingItem) {
          existingItem.quantity += item.quantity
          if (existingItem.maxQuantity && existingItem.quantity > existingItem.maxQuantity) {
            existingItem.quantity = existingItem.maxQuantity
          }
        } else {
          cart.items.push(item)
        }
        
        state.carts[shopId] = calculateCartTotals(cart)
        state.totalItemsCount = Object.values(state.carts).reduce(
          (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0
        )
        state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
      }
    },
    
    updateItemQuantity: (state, action: PayloadAction<{ shopId: string; itemId: string; quantity: number }>) => {
      const { shopId, itemId, quantity } = action.payload
      const cart = state.carts[shopId]
      
      if (cart) {
        const item = cart.items.find(i => i.id === itemId)
        if (item) {
          if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.id !== itemId)
          } else {
            item.quantity = quantity
            if (item.maxQuantity && item.quantity > item.maxQuantity) {
              item.quantity = item.maxQuantity
            }
          }
          
          state.carts[shopId] = calculateCartTotals(cart)
          state.totalItemsCount = Object.values(state.carts).reduce(
            (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0
          )
          state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
        }
      }
    },
    
    removeItem: (state, action: PayloadAction<{ shopId: string; itemId: string }>) => {
      const { shopId, itemId } = action.payload
      const cart = state.carts[shopId]
      
      if (cart) {
        cart.items = cart.items.filter(i => i.id !== itemId)
        
        if (cart.items.length === 0) {
          delete state.carts[shopId]
          state.totalCartsCount--
          if (state.activeCartId === shopId) {
            state.activeCartId = null
          }
        } else {
          state.carts[shopId] = calculateCartTotals(cart)
        }
        
        state.totalItemsCount = Object.values(state.carts).reduce(
          (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0
        )
        state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
      }
    },
    
    setActiveCart: (state, action: PayloadAction<string | null>) => {
      state.activeCartId = action.payload
    },
    
    clearCart: (state, action: PayloadAction<string>) => {
      const shopId = action.payload
      if (state.carts[shopId]) {
        delete state.carts[shopId]
        state.totalCartsCount--
        if (state.activeCartId === shopId) {
          state.activeCartId = null
        }
        
        state.totalItemsCount = Object.values(state.carts).reduce(
          (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0
        )
        state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
      }
    },
    
    clearAllCarts: (state) => {
      state.carts = {}
      state.activeCartId = null
      state.totalCartsCount = 0
      state.totalItemsCount = 0
      state.totalAmount = 0
    },
    
    applyDiscountToCart: (state, action: PayloadAction<{ shopId: string; discount: number }>) => {
      const { shopId, discount } = action.payload
      const cart = state.carts[shopId]
      
      if (cart) {
        cart.discount = discount
        state.carts[shopId] = calculateCartTotals(cart)
        state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
      }
    },
    
    updateDeliveryFee: (state, action: PayloadAction<{ shopId: string; deliveryFee: number }>) => {
      const { shopId, deliveryFee } = action.payload
      const cart = state.carts[shopId]
      
      if (cart) {
        cart.deliveryFee = deliveryFee
        state.carts[shopId] = calculateCartTotals(cart)
        state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCarts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllCarts.fulfilled, (state, action) => {
        state.carts = action.payload.carts
        state.totalCartsCount = Object.keys(action.payload.carts).length
        state.totalItemsCount = Object.values(action.payload.carts as { [key: string]: ShopCart }).reduce(
          (sum, cart) => sum + cart.items.reduce((s, i) => s + i.quantity, 0), 0
        )
        state.totalAmount = Object.values(action.payload.carts as { [key: string]: ShopCart }).reduce(
          (sum, cart) => sum + cart.total, 0
        )
        state.lastSyncTime = Date.now()
        state.loading = false
      })
      .addCase(fetchAllCarts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch carts'
      })
      
      .addCase(clearShopCart.fulfilled, (state, action) => {
        const shopId = action.payload
        if (state.carts[shopId]) {
          delete state.carts[shopId]
          state.totalCartsCount--
          if (state.activeCartId === shopId) {
            state.activeCartId = null
          }
          
          state.totalItemsCount = Object.values(state.carts).reduce(
            (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0
          )
          state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
        }
      })
      
      .addCase(syncCartsWithServer.fulfilled, (state) => {
        state.lastSyncTime = Date.now()
      })
      
      .addCase(checkoutShopCart.fulfilled, (state, action) => {
        const { shopId } = action.meta.arg
        if (state.carts[shopId]) {
          delete state.carts[shopId]
          state.totalCartsCount--
          if (state.activeCartId === shopId) {
            state.activeCartId = null
          }
          
          state.totalItemsCount = Object.values(state.carts).reduce(
            (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0
          )
          state.totalAmount = Object.values(state.carts).reduce((sum, c) => sum + c.total, 0)
        }
      })
  }
})

export const {
  createOrUpdateCart,
  addItemToCart,
  updateItemQuantity,
  removeItem,
  setActiveCart,
  clearCart,
  clearAllCarts,
  applyDiscountToCart,
  updateDeliveryFee
} = multiCartSlice.actions

export const selectAllCarts = (state: RootState) => state.multiCart.carts
export const selectActiveCart = (state: RootState) => 
  state.multiCart.activeCartId ? state.multiCart.carts[state.multiCart.activeCartId] : null
export const selectCartByShopId = (shopId: string) => (state: RootState) => 
  state.multiCart.carts[shopId]
export const selectTotalCartsCount = (state: RootState) => state.multiCart.totalCartsCount
export const selectTotalItemsCount = (state: RootState) => state.multiCart.totalItemsCount
export const selectTotalAmount = (state: RootState) => state.multiCart.totalAmount
export const selectValidCarts = (state: RootState) => 
  Object.values(state.multiCart.carts).filter(cart => cart.isValid)
export const selectInvalidCarts = (state: RootState) => 
  Object.values(state.multiCart.carts).filter(cart => !cart.isValid)

export default multiCartSlice.reducer