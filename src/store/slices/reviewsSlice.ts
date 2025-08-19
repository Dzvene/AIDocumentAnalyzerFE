import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  productId: string
  orderId?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  notHelpful: number
  userHelpfulVote?: 'helpful' | 'not_helpful' | null
  createdAt: string
  updatedAt: string
  reply?: {
    id: string
    shopId: string
    shopName: string
    message: string
    createdAt: string
  }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

interface ReviewsState {
  reviews: Review[]
  userReviews: Review[]
  productReviews: Review[]
  selectedReview: Review | null
  reviewStats: ReviewStats | null
  loading: boolean
  error: string | null
  filters: {
    rating: number | null
    verified: boolean | null
    sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
    searchQuery: string
  }
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
}

const initialState: ReviewsState = {
  reviews: [],
  userReviews: [],
  productReviews: [],
  selectedReview: null,
  reviewStats: null,
  loading: false,
  error: null,
  filters: {
    rating: null,
    verified: null,
    sortBy: 'newest',
    searchQuery: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalItems: 0
  }
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.reviews = action.payload
      state.loading = false
      state.error = null
    },
    setUserReviews: (state, action: PayloadAction<Review[]>) => {
      state.userReviews = action.payload
      state.loading = false
      state.error = null
    },
    setProductReviews: (state, action: PayloadAction<Review[]>) => {
      state.productReviews = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedReview: (state, action: PayloadAction<Review | null>) => {
      state.selectedReview = action.payload
    },
    setReviewStats: (state, action: PayloadAction<ReviewStats>) => {
      state.reviewStats = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<ReviewsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action: PayloadAction<Partial<ReviewsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addReview: (state, action: PayloadAction<Review>) => {
      state.reviews.unshift(action.payload)
      state.userReviews.unshift(action.payload)
      state.productReviews.unshift(action.payload)
    },
    updateReview: (state, action: PayloadAction<Review>) => {
      const updateInArray = (array: Review[]) => {
        const index = array.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          array[index] = action.payload
        }
      }
      
      updateInArray(state.reviews)
      updateInArray(state.userReviews)
      updateInArray(state.productReviews)
      
      if (state.selectedReview?.id === action.payload.id) {
        state.selectedReview = action.payload
      }
    },
    removeReview: (state, action: PayloadAction<string>) => {
      state.reviews = state.reviews.filter(r => r.id !== action.payload)
      state.userReviews = state.userReviews.filter(r => r.id !== action.payload)
      state.productReviews = state.productReviews.filter(r => r.id !== action.payload)
    },
    voteHelpful: (state, action: PayloadAction<{ reviewId: string; vote: 'helpful' | 'not_helpful' }>) => {
      const updateVote = (review: Review) => {
        if (review.userHelpfulVote === action.payload.vote) {
          if (action.payload.vote === 'helpful') review.helpful--
          else review.notHelpful--
          review.userHelpfulVote = null
        } else {
          if (review.userHelpfulVote === 'helpful') review.helpful--
          if (review.userHelpfulVote === 'not_helpful') review.notHelpful--
          
          if (action.payload.vote === 'helpful') review.helpful++
          else review.notHelpful++
          review.userHelpfulVote = action.payload.vote
        }
      }

      const review = state.reviews.find(r => r.id === action.payload.reviewId)
      if (review) updateVote(review)
      
      const productReview = state.productReviews.find(r => r.id === action.payload.reviewId)
      if (productReview) updateVote(productReview)
    },
    addReviewReply: (state, action: PayloadAction<{ reviewId: string; reply: Review['reply'] }>) => {
      const updateReply = (review: Review) => {
        review.reply = action.payload.reply
      }

      const review = state.reviews.find(r => r.id === action.payload.reviewId)
      if (review) updateReply(review)
      
      const productReview = state.productReviews.find(r => r.id === action.payload.reviewId)
      if (productReview) updateReply(productReview)
    }
  }
})

export const {
  setReviews,
  setUserReviews,
  setProductReviews,
  setSelectedReview,
  setReviewStats,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  addReview,
  updateReview,
  removeReview,
  voteHelpful,
  addReviewReply
} = reviewsSlice.actions

export default reviewsSlice.reducer