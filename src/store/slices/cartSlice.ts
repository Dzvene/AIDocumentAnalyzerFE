import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { cartApi } from '@api'
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@types/interfaces/cart'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  error: string | null
  itemCount: number
  total: number
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,
  total: 0
}

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (cartId?: string) => {
    const response = await cartApi.getCart(cartId)
    return response
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: AddToCartRequest) => {
    const response = await cartApi.addToCart(data)
    return response
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: UpdateCartItemRequest) => {
    const response = await cartApi.updateCartItem(data)
    return response
  }
)

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId: string) => {
    const response = await cartApi.removeCartItem(itemId)
    return response
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async () => {
    await cartApi.clearCart()
    return null
  }
)

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponCode: string) => {
    const response = await cartApi.applyCoupon({ couponCode })
    return response
  }
)

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async () => {
    const response = await cartApi.removeCoupon()
    return response
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateItemCount: (state) => {
      if (state.cart) {
        state.itemCount = state.cart.itemCount
        state.total = state.cart.total
      }
    },
    // Local optimistic updates
    optimisticAddToCart: (state, action: PayloadAction<{ product: any; quantity: number }>) => {
      if (!state.cart) {
        // Create a new cart if one doesn't exist
        state.cart = {
          id: 'temp-' + Date.now(),
          items: [],
          itemCount: 0,
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
          discount: 0,
          updatedAt: new Date().toISOString()
        }
      }

      const { product, quantity } = action.payload
      const existingItemIndex = state.cart.items.findIndex(item => item.productId === product.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        state.cart.items[existingItemIndex].quantity += quantity
        state.cart.items[existingItemIndex].totalPrice = 
          state.cart.items[existingItemIndex].quantity * state.cart.items[existingItemIndex].price
      } else {
        // Add new item
        const newItem: CartItem = {
          id: 'temp-' + Date.now(),
          productId: product.id,
          product: product,
          quantity: quantity,
          price: product.price,
          totalPrice: product.price * quantity
        }
        state.cart.items.push(newItem)
      }

      // Recalculate totals
      state.cart.itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
      state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.cart.total = state.cart.subtotal + state.cart.deliveryFee - state.cart.discount

      state.itemCount = state.cart.itemCount
      state.total = state.cart.total
    },
    optimisticRemoveFromCart: (state, action: PayloadAction<string>) => {
      if (!state.cart) return

      const itemId = action.payload
      state.cart.items = state.cart.items.filter(item => item.id !== itemId)

      // Recalculate totals
      state.cart.itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
      state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.cart.total = state.cart.subtotal + state.cart.deliveryFee - state.cart.discount

      state.itemCount = state.cart.itemCount
      state.total = state.cart.total
    }
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.itemCount = action.payload.itemCount
        state.total = action.payload.total
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось загрузить корзину'
      })

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.itemCount = action.payload.itemCount
        state.total = action.payload.total
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось добавить товар в корзину'
      })

    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.itemCount = action.payload.itemCount
        state.total = action.payload.total
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось обновить товар в корзине'
      })

    // Remove cart item
    builder
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.itemCount = action.payload.itemCount
        state.total = action.payload.total
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось удалить товар из корзины'
      })

    // Clear cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false
        state.cart = null
        state.itemCount = 0
        state.total = 0
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось очистить корзину'
      })

    // Apply coupon
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.itemCount = action.payload.itemCount
        state.total = action.payload.total
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось применить купон'
      })

    // Remove coupon
    builder
      .addCase(removeCoupon.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.itemCount = action.payload.itemCount
        state.total = action.payload.total
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось удалить купон'
      })
  }
})

export const { 
  clearError, 
  updateItemCount,
  optimisticAddToCart,
  optimisticRemoveFromCart
} = cartSlice.actions

export default cartSlice.reducer

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.itemCount
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total
export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading
export const selectCartError = (state: { cart: CartState }) => state.cart.error
export const selectCartItems = (state: { cart: CartState }) => state.cart.cart?.items || []