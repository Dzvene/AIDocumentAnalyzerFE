import { apiClient } from './config'
import { PaginatedResponse } from '@types/interfaces/common'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  productId: string
  productName: string
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

interface CreateReviewRequest {
  productId: string
  orderId?: string
  rating: number
  title: string
  comment: string
  images?: string[]
}

interface UpdateReviewRequest {
  rating?: number
  title?: string
  comment?: string
  images?: string[]
}

interface ReplyToReviewRequest {
  message: string
}

interface ReviewFilters {
  rating?: number
  verified?: boolean
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
  search?: string
}

export const reviewsApi = {
  // Get reviews
  getReviews: async (params?: ReviewFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>>('/reviews', { params })
  },

  getProductReviews: async (productId: string, params?: ReviewFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`, { params })
  },

  getUserReviews: async (userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>>(`/users/${userId}/reviews`, { params })
  },

  getMyReviews: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>>('/reviews/my', { params })
  },

  getReviewById: async (id: string): Promise<Review> => {
    return apiClient.get<Review>(`/reviews/${id}`)
  },

  // Review statistics
  getProductReviewStats: async (productId: string): Promise<ReviewStats> => {
    return apiClient.get<ReviewStats>(`/products/${productId}/reviews/stats`)
  },

  getShopReviewStats: async (shopId: string): Promise<ReviewStats> => {
    return apiClient.get<ReviewStats>(`/shops/${shopId}/reviews/stats`)
  },

  // Create review
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    return apiClient.post<Review>('/reviews', data)
  },

  // Update review
  updateReview: async (id: string, data: UpdateReviewRequest): Promise<Review> => {
    return apiClient.patch<Review>(`/reviews/${id}`, data)
  },

  // Delete review
  deleteReview: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/reviews/${id}`)
  },

  // Vote on review helpfulness
  voteHelpful: async (id: string): Promise<{ helpful: number; userVote: 'helpful' | null }> => {
    return apiClient.post<{ helpful: number; userVote: 'helpful' | null }>(`/reviews/${id}/helpful`)
  },

  voteNotHelpful: async (id: string): Promise<{ notHelpful: number; userVote: 'not_helpful' | null }> => {
    return apiClient.post<{ notHelpful: number; userVote: 'not_helpful' | null }>(`/reviews/${id}/not-helpful`)
  },

  removeVote: async (id: string): Promise<{ helpful: number; notHelpful: number; userVote: null }> => {
    return apiClient.delete<{ helpful: number; notHelpful: number; userVote: null }>(`/reviews/${id}/vote`)
  },

  // Shop replies to reviews
  replyToReview: async (id: string, data: ReplyToReviewRequest): Promise<Review> => {
    return apiClient.post<Review>(`/reviews/${id}/reply`, data)
  },

  updateReviewReply: async (reviewId: string, data: ReplyToReviewRequest): Promise<Review> => {
    return apiClient.patch<Review>(`/reviews/${reviewId}/reply`, data)
  },

  deleteReviewReply: async (reviewId: string): Promise<Review> => {
    return apiClient.delete<Review>(`/reviews/${reviewId}/reply`)
  },

  // Report review
  reportReview: async (id: string, reason: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/reviews/${id}/report`, { reason })
  },

  // Admin endpoints
  adminGetReviews: async (params?: ReviewFilters & { 
    page?: number
    limit?: number
    status?: 'pending' | 'approved' | 'rejected'
    shopId?: string
    userId?: string
  }): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>>('/admin/reviews', { params })
  },

  adminApproveReview: async (id: string): Promise<Review> => {
    return apiClient.patch<Review>(`/admin/reviews/${id}/approve`)
  },

  adminRejectReview: async (id: string, reason?: string): Promise<Review> => {
    return apiClient.patch<Review>(`/admin/reviews/${id}/reject`, { reason })
  },

  adminDeleteReview: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/reviews/${id}`)
  },

  // Bulk operations
  bulkDeleteReviews: async (reviewIds: string[]): Promise<{ message: string; deletedCount: number }> => {
    return apiClient.post<{ message: string; deletedCount: number }>('/reviews/bulk-delete', { reviewIds })
  },

  // Review reminders
  getReviewReminders: async (): Promise<Array<{
    id: string
    orderId: string
    productId: string
    productName: string
    purchaseDate: string
    reminderDate: string
  }>> => {
    return apiClient.get<Array<{
      id: string
      orderId: string
      productId: string
      productName: string
      purchaseDate: string
      reminderDate: string
    }>>('/reviews/reminders')
  },

  dismissReviewReminder: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/reviews/reminders/${id}`)
  }
}