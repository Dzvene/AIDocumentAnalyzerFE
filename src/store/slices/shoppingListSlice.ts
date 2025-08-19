import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

export interface ShoppingListItem {
  id: string
  name: string
  quantity: number
  unit?: string
  category?: string
  notes?: string
  isChecked: boolean
  addedAt: number
}

export interface MatchedProduct {
  productId: string
  name: string
  price: number
  unit: string
  image?: string
  discount?: number
  finalPrice: number
  inStock: boolean
}

export interface ShopMatch {
  shopId: string
  shopName: string
  shopLogo?: string
  shopRating: number
  distance: number
  deliveryTime: string
  deliveryFee: number
  minOrderAmount: number
  matchPercentage: number
  matchedItems: {
    listItemId: string
    product: MatchedProduct
  }[]
  missingItems: string[]
  subtotal: number
  total: number
  savings: number
  isOpen: boolean
}

export type MatchFilter = 'all' | 'complete' | 'partial'
export type SortBy = 'match' | 'price' | 'distance' | 'rating'

interface ShoppingListState {
  items: ShoppingListItem[]
  matchedShops: ShopMatch[]
  bestMatch: ShopMatch | null
  cheapestOption: ShopMatch | null
  closestOption: ShopMatch | null
  filter: MatchFilter
  sortBy: SortBy
  isMatching: boolean
  lastMatchTime: number | null
  savedLists: {
    id: string
    name: string
    items: ShoppingListItem[]
    createdAt: number
  }[]
  activeListId: string | null
  error: string | null
}

const initialState: ShoppingListState = {
  items: [],
  matchedShops: [],
  bestMatch: null,
  cheapestOption: null,
  closestOption: null,
  filter: 'all',
  sortBy: 'match',
  isMatching: false,
  lastMatchTime: null,
  savedLists: [],
  activeListId: null,
  error: null
}

export const matchShoppingList = createAsyncThunk(
  'shoppingList/match',
  async ({ items, location }: { 
    items: ShoppingListItem[]; 
    location: { lat: number; lng: number } 
  }) => {
    const response = await fetch('/api/shopping-list/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, location })
    })
    if (!response.ok) {
      throw new Error('Failed to match shopping list')
    }
    return response.json()
  }
)

export const optimizeByPrice = createAsyncThunk(
  'shoppingList/optimize',
  async ({ items, location }: { 
    items: ShoppingListItem[]; 
    location: { lat: number; lng: number } 
  }) => {
    const response = await fetch('/api/shopping-list/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, location })
    })
    if (!response.ok) {
      throw new Error('Failed to optimize shopping list')
    }
    return response.json()
  }
)

export const saveShoppingList = createAsyncThunk(
  'shoppingList/save',
  async ({ name, items }: { name: string; items: ShoppingListItem[] }) => {
    const response = await fetch('/api/shopping-list/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, items })
    })
    if (!response.ok) {
      throw new Error('Failed to save shopping list')
    }
    return response.json()
  }
)

export const loadShoppingList = createAsyncThunk(
  'shoppingList/load',
  async (listId: string) => {
    const response = await fetch(`/api/shopping-list/${listId}`)
    if (!response.ok) {
      throw new Error('Failed to load shopping list')
    }
    return response.json()
  }
)

export const deleteShoppingList = createAsyncThunk(
  'shoppingList/delete',
  async (listId: string) => {
    const response = await fetch(`/api/shopping-list/${listId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete shopping list')
    }
    return listId
  }
)

export const getSuggestedItems = createAsyncThunk(
  'shoppingList/suggestions',
  async (query: string) => {
    const response = await fetch(`/api/shopping-list/suggestions?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error('Failed to get suggestions')
    }
    return response.json()
  }
)

export const importFromReceipt = createAsyncThunk(
  'shoppingList/importReceipt',
  async (receiptImage: File) => {
    const formData = new FormData()
    formData.append('receipt', receiptImage)
    
    const response = await fetch('/api/shopping-list/import-receipt', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Failed to import receipt')
    }
    return response.json()
  }
)

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<ShoppingListItem, 'id' | 'addedAt' | 'isChecked'>>) => {
      const newItem: ShoppingListItem = {
        ...action.payload,
        id: `item_${Date.now()}_${Math.random()}`,
        isChecked: false,
        addedAt: Date.now()
      }
      state.items.push(newItem)
    },
    
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<ShoppingListItem> }>) => {
      const { id, updates } = action.payload
      const item = state.items.find(i => i.id === id)
      if (item) {
        Object.assign(item, updates)
      }
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    
    toggleItemCheck: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload)
      if (item) {
        item.isChecked = !item.isChecked
      }
    },
    
    clearList: (state) => {
      state.items = []
      state.matchedShops = []
      state.bestMatch = null
      state.cheapestOption = null
      state.closestOption = null
    },
    
    clearCheckedItems: (state) => {
      state.items = state.items.filter(i => !i.isChecked)
    },
    
    setFilter: (state, action: PayloadAction<MatchFilter>) => {
      state.filter = action.payload
    },
    
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload
      
      switch (action.payload) {
        case 'match':
          state.matchedShops.sort((a, b) => b.matchPercentage - a.matchPercentage)
          break
        case 'price':
          state.matchedShops.sort((a, b) => a.total - b.total)
          break
        case 'distance':
          state.matchedShops.sort((a, b) => a.distance - b.distance)
          break
        case 'rating':
          state.matchedShops.sort((a, b) => b.shopRating - a.shopRating)
          break
      }
    },
    
    setActiveList: (state, action: PayloadAction<string | null>) => {
      state.activeListId = action.payload
      if (action.payload) {
        const list = state.savedLists.find(l => l.id === action.payload)
        if (list) {
          state.items = [...list.items]
        }
      }
    },
    
    importItems: (state, action: PayloadAction<ShoppingListItem[]>) => {
      const newItems = action.payload.map(item => ({
        ...item,
        id: `item_${Date.now()}_${Math.random()}`,
        addedAt: Date.now()
      }))
      state.items.push(...newItems)
    },
    
    reorderItems: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload
      const [removed] = state.items.splice(fromIndex, 1)
      state.items.splice(toIndex, 0, removed)
    },
    
    duplicateItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload)
      if (item) {
        const duplicate: ShoppingListItem = {
          ...item,
          id: `item_${Date.now()}_${Math.random()}`,
          addedAt: Date.now()
        }
        const index = state.items.findIndex(i => i.id === action.payload)
        state.items.splice(index + 1, 0, duplicate)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(matchShoppingList.pending, (state) => {
        state.isMatching = true
        state.error = null
      })
      .addCase(matchShoppingList.fulfilled, (state, action) => {
        state.matchedShops = action.payload.matches
        state.bestMatch = action.payload.bestMatch
        state.cheapestOption = action.payload.cheapestOption
        state.closestOption = action.payload.closestOption
        state.lastMatchTime = Date.now()
        state.isMatching = false
      })
      .addCase(matchShoppingList.rejected, (state, action) => {
        state.isMatching = false
        state.error = action.error.message || 'Failed to match shopping list'
      })
      
      .addCase(optimizeByPrice.fulfilled, (state, action) => {
        state.matchedShops = action.payload.optimizedMatches
        state.cheapestOption = action.payload.cheapestCombination
      })
      
      .addCase(saveShoppingList.fulfilled, (state, action) => {
        state.savedLists.push(action.payload)
      })
      
      .addCase(loadShoppingList.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.activeListId = action.payload.id
      })
      
      .addCase(deleteShoppingList.fulfilled, (state, action) => {
        state.savedLists = state.savedLists.filter(l => l.id !== action.payload)
        if (state.activeListId === action.payload) {
          state.activeListId = null
        }
      })
      
      .addCase(importFromReceipt.fulfilled, (state, action) => {
        const importedItems = action.payload.items.map((item: any) => ({
          ...item,
          id: `item_${Date.now()}_${Math.random()}`,
          isChecked: false,
          addedAt: Date.now()
        }))
        state.items.push(...importedItems)
      })
  }
})

export const {
  addItem,
  updateItem,
  removeItem,
  toggleItemCheck,
  clearList,
  clearCheckedItems,
  setFilter,
  setSortBy,
  setActiveList,
  importItems,
  reorderItems,
  duplicateItem
} = shoppingListSlice.actions

export const selectShoppingListItems = (state: RootState) => state.shoppingList.items
export const selectUncheckedItems = (state: RootState) => 
  state.shoppingList.items.filter(item => !item.isChecked)
export const selectCheckedItems = (state: RootState) => 
  state.shoppingList.items.filter(item => item.isChecked)
export const selectMatchedShops = (state: RootState) => {
  const { matchedShops, filter } = state.shoppingList
  
  switch (filter) {
    case 'complete':
      return matchedShops.filter(shop => shop.matchPercentage === 100)
    case 'partial':
      return matchedShops.filter(shop => shop.matchPercentage < 100)
    default:
      return matchedShops
  }
}
export const selectBestMatch = (state: RootState) => state.shoppingList.bestMatch
export const selectCheapestOption = (state: RootState) => state.shoppingList.cheapestOption
export const selectClosestOption = (state: RootState) => state.shoppingList.closestOption
export const selectSavedLists = (state: RootState) => state.shoppingList.savedLists
export const selectActiveList = (state: RootState) => {
  const { activeListId, savedLists } = state.shoppingList
  return savedLists.find(list => list.id === activeListId)
}
export const selectIsMatching = (state: RootState) => state.shoppingList.isMatching

export default shoppingListSlice.reducer