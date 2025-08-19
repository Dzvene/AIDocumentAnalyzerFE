import { apiClient } from './config'
import { PaginatedResponse } from '@types/interfaces/common'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  images?: string[]
  author: {
    id: string
    name: string
    avatar?: string
    bio?: string
  }
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  readTime: number
  views: number
  likes: number
  shares: number
  commentsCount: number
  isLiked?: boolean
  isFeatured: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  customFields?: Record<string, any>
}

interface BlogComment {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  parentId?: string
  replies?: BlogComment[]
  likes: number
  isLiked?: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  postCount: number
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface CreatePostRequest {
  title: string
  slug?: string
  excerpt?: string
  content: string
  featuredImage?: string
  images?: string[]
  category: string
  tags?: string[]
  status?: 'draft' | 'published'
  isFeatured?: boolean
  publishedAt?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  customFields?: Record<string, any>
}

interface UpdatePostRequest {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  featuredImage?: string
  images?: string[]
  category?: string
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
  isFeatured?: boolean
  publishedAt?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  customFields?: Record<string, any>
}

interface CreateCommentRequest {
  postId: string
  content: string
  parentId?: string
}

interface UpdateCommentRequest {
  content: string
}

interface CreateCategoryRequest {
  name: string
  slug?: string
  description?: string
  image?: string
  isActive?: boolean
  order?: number
}

interface PostFilters {
  category?: string
  author?: string
  tags?: string[]
  status?: BlogPost['status']
  isFeatured?: boolean
  search?: string
  startDate?: string
  endDate?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'views' | 'likes'
}

export const blogApi = {
  // Posts
  getPosts: async (params?: PostFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<BlogPost>> => {
    return apiClient.get<PaginatedResponse<BlogPost>>('/blog/posts', { params })
  },

  getPostById: async (id: string): Promise<BlogPost> => {
    return apiClient.get<BlogPost>(`/blog/posts/${id}`)
  },

  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    return apiClient.get<BlogPost>(`/blog/posts/slug/${slug}`)
  },

  getFeaturedPosts: async (limit: number = 5): Promise<BlogPost[]> => {
    return apiClient.get<BlogPost[]>('/blog/posts/featured', {
      params: { limit }
    })
  },

  getPopularPosts: async (limit: number = 10, period: 'day' | 'week' | 'month' = 'month'): Promise<BlogPost[]> => {
    return apiClient.get<BlogPost[]>('/blog/posts/popular', {
      params: { limit, period }
    })
  },

  getRecentPosts: async (limit: number = 10): Promise<BlogPost[]> => {
    return apiClient.get<BlogPost[]>('/blog/posts/recent', {
      params: { limit }
    })
  },

  getRelatedPosts: async (postId: string, limit: number = 5): Promise<BlogPost[]> => {
    return apiClient.get<BlogPost[]>(`/blog/posts/${postId}/related`, {
      params: { limit }
    })
  },

  getPostsByCategory: async (categorySlug: string, params?: Omit<PostFilters, 'category'> & { page?: number; limit?: number }): Promise<PaginatedResponse<BlogPost>> => {
    return apiClient.get<PaginatedResponse<BlogPost>>(`/blog/categories/${categorySlug}/posts`, { params })
  },

  getPostsByTag: async (tag: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BlogPost>> => {
    return apiClient.get<PaginatedResponse<BlogPost>>(`/blog/tags/${tag}/posts`, { params })
  },

  getPostsByAuthor: async (authorId: string, params?: Omit<PostFilters, 'author'> & { page?: number; limit?: number }): Promise<PaginatedResponse<BlogPost>> => {
    return apiClient.get<PaginatedResponse<BlogPost>>(`/blog/authors/${authorId}/posts`, { params })
  },

  searchPosts: async (query: string, params?: Omit<PostFilters, 'search'> & { page?: number; limit?: number }): Promise<PaginatedResponse<BlogPost>> => {
    return apiClient.get<PaginatedResponse<BlogPost>>('/blog/posts/search', {
      params: { query, ...params }
    })
  },

  // Post management
  createPost: async (data: CreatePostRequest): Promise<BlogPost> => {
    return apiClient.post<BlogPost>('/blog/posts', data)
  },

  updatePost: async (id: string, data: UpdatePostRequest): Promise<BlogPost> => {
    return apiClient.patch<BlogPost>(`/blog/posts/${id}`, data)
  },

  deletePost: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/blog/posts/${id}`)
  },

  publishPost: async (id: string): Promise<BlogPost> => {
    return apiClient.patch<BlogPost>(`/blog/posts/${id}/publish`)
  },

  unpublishPost: async (id: string): Promise<BlogPost> => {
    return apiClient.patch<BlogPost>(`/blog/posts/${id}/unpublish`)
  },

  archivePost: async (id: string): Promise<BlogPost> => {
    return apiClient.patch<BlogPost>(`/blog/posts/${id}/archive`)
  },

  // Post interactions
  likePost: async (id: string): Promise<{ likes: number; isLiked: boolean }> => {
    return apiClient.post<{ likes: number; isLiked: boolean }>(`/blog/posts/${id}/like`)
  },

  sharePost: async (id: string, platform: string): Promise<{ shares: number }> => {
    return apiClient.post<{ shares: number }>(`/blog/posts/${id}/share`, { platform })
  },

  incrementViews: async (id: string): Promise<{ views: number }> => {
    return apiClient.post<{ views: number }>(`/blog/posts/${id}/view`)
  },

  // Comments
  getPostComments: async (postId: string, params?: { page?: number; limit?: number; sortBy?: 'newest' | 'oldest' | 'popular' }): Promise<PaginatedResponse<BlogComment>> => {
    return apiClient.get<PaginatedResponse<BlogComment>>(`/blog/posts/${postId}/comments`, { params })
  },

  getComment: async (id: string): Promise<BlogComment> => {
    return apiClient.get<BlogComment>(`/blog/comments/${id}`)
  },

  createComment: async (data: CreateCommentRequest): Promise<BlogComment> => {
    return apiClient.post<BlogComment>('/blog/comments', data)
  },

  updateComment: async (id: string, data: UpdateCommentRequest): Promise<BlogComment> => {
    return apiClient.patch<BlogComment>(`/blog/comments/${id}`, data)
  },

  deleteComment: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/blog/comments/${id}`)
  },

  likeComment: async (id: string): Promise<{ likes: number; isLiked: boolean }> => {
    return apiClient.post<{ likes: number; isLiked: boolean }>(`/blog/comments/${id}/like`)
  },

  reportComment: async (id: string, reason: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/blog/comments/${id}/report`, { reason })
  },

  // Categories
  getCategories: async (): Promise<BlogCategory[]> => {
    return apiClient.get<BlogCategory[]>('/blog/categories')
  },

  getCategoryById: async (id: string): Promise<BlogCategory> => {
    return apiClient.get<BlogCategory>(`/blog/categories/${id}`)
  },

  getCategoryBySlug: async (slug: string): Promise<BlogCategory> => {
    return apiClient.get<BlogCategory>(`/blog/categories/slug/${slug}`)
  },

  createCategory: async (data: CreateCategoryRequest): Promise<BlogCategory> => {
    return apiClient.post<BlogCategory>('/blog/categories', data)
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryRequest>): Promise<BlogCategory> => {
    return apiClient.patch<BlogCategory>(`/blog/categories/${id}`, data)
  },

  deleteCategory: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/blog/categories/${id}`)
  },

  // Tags
  getTags: async (params?: { popular?: boolean; limit?: number }): Promise<Array<{
    name: string
    slug: string
    postCount: number
  }>> => {
    return apiClient.get<Array<{
      name: string
      slug: string
      postCount: number
    }>>('/blog/tags', { params })
  },

  getPopularTags: async (limit: number = 20): Promise<Array<{
    name: string
    slug: string
    postCount: number
  }>> => {
    return apiClient.get<Array<{
      name: string
      slug: string
      postCount: number
    }>>('/blog/tags/popular', {
      params: { limit }
    })
  },

  searchTags: async (query: string, limit: number = 10): Promise<Array<{
    name: string
    slug: string
    postCount: number
  }>> => {
    return apiClient.get<Array<{
      name: string
      slug: string
      postCount: number
    }>>('/blog/tags/search', {
      params: { query, limit }
    })
  },

  // Authors
  getAuthors: async (): Promise<Array<{
    id: string
    name: string
    avatar?: string
    bio?: string
    postCount: number
    totalViews: number
    totalLikes: number
  }>> => {
    return apiClient.get<Array<{
      id: string
      name: string
      avatar?: string
      bio?: string
      postCount: number
      totalViews: number
      totalLikes: number
    }>>('/blog/authors')
  },

  getAuthor: async (id: string): Promise<{
    id: string
    name: string
    avatar?: string
    bio?: string
    postCount: number
    totalViews: number
    totalLikes: number
    socialLinks?: Record<string, string>
  }> => {
    return apiClient.get<{
      id: string
      name: string
      avatar?: string
      bio?: string
      postCount: number
      totalViews: number
      totalLikes: number
      socialLinks?: Record<string, string>
    }>(`/blog/authors/${id}`)
  },

  // RSS and feeds
  getRSSFeed: async (category?: string): Promise<string> => {
    const params = category ? { category } : {}
    return apiClient.get<string>('/blog/rss', {
      params,
      responseType: 'text'
    })
  },

  getAtomFeed: async (category?: string): Promise<string> => {
    const params = category ? { category } : {}
    return apiClient.get<string>('/blog/atom', {
      params,
      responseType: 'text'
    })
  },

  // Statistics
  getBlogStats: async (): Promise<{
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    totalLikes: number
    totalComments: number
    averageReadTime: number
    topPosts: Array<{
      id: string
      title: string
      views: number
      likes: number
    }>
    topCategories: Array<{
      id: string
      name: string
      postCount: number
    }>
  }> => {
    return apiClient.get<{
      totalPosts: number
      publishedPosts: number
      draftPosts: number
      totalViews: number
      totalLikes: number
      totalComments: number
      averageReadTime: number
      topPosts: Array<{
        id: string
        title: string
        views: number
        likes: number
      }>
      topCategories: Array<{
        id: string
        name: string
        postCount: number
      }>
    }>('/blog/stats')
  },

  // Bulk operations
  bulkDeletePosts: async (postIds: string[]): Promise<{
    message: string
    deletedCount: number
  }> => {
    return apiClient.post<{
      message: string
      deletedCount: number
    }>('/blog/posts/bulk-delete', { postIds })
  },

  bulkUpdatePosts: async (updates: Array<{ id: string } & Partial<UpdatePostRequest>>): Promise<{
    updated: BlogPost[]
    errors: Array<{ id: string; error: string }>
  }> => {
    return apiClient.patch<{
      updated: BlogPost[]
      errors: Array<{ id: string; error: string }>
    }>('/blog/posts/bulk-update', { updates })
  },

  // Import/Export
  exportPosts: async (format: 'json' | 'csv' | 'xml', filters?: PostFilters): Promise<Blob> => {
    return apiClient.get<Blob>('/blog/posts/export', {
      params: { format, ...filters },
      responseType: 'blob'
    })
  },

  importPosts: async (file: File): Promise<{
    imported: number
    errors: Array<{
      row: number
      error: string
    }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post<{
      imported: number
      errors: Array<{
        row: number
        error: string
      }>
    }>('/blog/posts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}