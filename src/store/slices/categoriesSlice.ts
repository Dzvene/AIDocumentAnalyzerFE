import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parentId?: string
  level: number
  order: number
  isActive: boolean
  productCount: number
  children?: Category[]
  path: string[]
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

interface CategoryTree extends Category {
  children: CategoryTree[]
}

interface CategoriesState {
  categories: Category[]
  categoryTree: CategoryTree[]
  selectedCategory: Category | null
  currentCategoryPath: Category[]
  popularCategories: Category[]
  featuredCategories: Category[]
  loading: boolean
  error: string | null
  filters: {
    searchQuery: string
    level: number | null
    isActive: boolean | null
    parentId: string | null
  }
}

const initialState: CategoriesState = {
  categories: [],
  categoryTree: [],
  selectedCategory: null,
  currentCategoryPath: [],
  popularCategories: [],
  featuredCategories: [],
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    level: null,
    isActive: null,
    parentId: null
  }
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload
      state.loading = false
      state.error = null
    },
    setCategoryTree: (state, action: PayloadAction<CategoryTree[]>) => {
      state.categoryTree = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
      if (action.payload) {
        state.currentCategoryPath = action.payload.path.map(pathId => 
          state.categories.find(cat => cat.id === pathId)
        ).filter(Boolean) as Category[]
      } else {
        state.currentCategoryPath = []
      }
    },
    setCurrentCategoryPath: (state, action: PayloadAction<Category[]>) => {
      state.currentCategoryPath = action.payload
    },
    setPopularCategories: (state, action: PayloadAction<Category[]>) => {
      state.popularCategories = action.payload
    },
    setFeaturedCategories: (state, action: PayloadAction<Category[]>) => {
      state.featuredCategories = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<CategoriesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload)
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id)
      if (index !== -1) {
        state.categories[index] = action.payload
      }
      if (state.selectedCategory?.id === action.payload.id) {
        state.selectedCategory = action.payload
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload)
      if (state.selectedCategory?.id === action.payload) {
        state.selectedCategory = null
        state.currentCategoryPath = []
      }
    },
    updateCategoryProductCount: (state, action: PayloadAction<{ categoryId: string; count: number }>) => {
      const category = state.categories.find(cat => cat.id === action.payload.categoryId)
      if (category) {
        category.productCount = action.payload.count
      }
    },
    reorderCategories: (state, action: PayloadAction<{ categoryId: string; newOrder: number }[]>) => {
      action.payload.forEach(({ categoryId, newOrder }) => {
        const category = state.categories.find(cat => cat.id === categoryId)
        if (category) {
          category.order = newOrder
        }
      })
      state.categories.sort((a, b) => a.order - b.order)
    },
    toggleCategoryStatus: (state, action: PayloadAction<string>) => {
      const category = state.categories.find(cat => cat.id === action.payload)
      if (category) {
        category.isActive = !category.isActive
      }
    },
    buildCategoryTree: (state) => {
      const buildTree = (parentId?: string): CategoryTree[] => {
        return state.categories
          .filter(cat => cat.parentId === parentId && cat.isActive)
          .sort((a, b) => a.order - b.order)
          .map(cat => ({
            ...cat,
            children: buildTree(cat.id)
          }))
      }
      state.categoryTree = buildTree()
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null
      state.currentCategoryPath = []
    }
  }
})

export const {
  setCategories,
  setCategoryTree,
  setSelectedCategory,
  setCurrentCategoryPath,
  setPopularCategories,
  setFeaturedCategories,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  addCategory,
  updateCategory,
  removeCategory,
  updateCategoryProductCount,
  reorderCategories,
  toggleCategoryStatus,
  buildCategoryTree,
  clearSelectedCategory
} = categoriesSlice.actions

export default categoriesSlice.reducer