import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  createdAt: string
  updatedAt: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  postCount: number
  isActive: boolean
}

interface BlogState {
  posts: BlogPost[]
  selectedPost: BlogPost | null
  featuredPosts: BlogPost[]
  popularPosts: BlogPost[]
  recentPosts: BlogPost[]
  relatedPosts: BlogPost[]
  comments: BlogComment[]
  categories: BlogCategory[]
  tags: string[]
  loading: boolean
  error: string | null
  filters: {
    category: string | null
    tag: string | null
    author: string | null
    searchQuery: string
    status: BlogPost['status'] | null
    sortBy: 'newest' | 'oldest' | 'popular' | 'views'
  }
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
}

const initialState: BlogState = {
  posts: [],
  selectedPost: null,
  featuredPosts: [],
  popularPosts: [],
  recentPosts: [],
  relatedPosts: [],
  comments: [],
  categories: [],
  tags: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    tag: null,
    author: null,
    searchQuery: '',
    status: null,
    sortBy: 'newest'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
    totalItems: 0
  }
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.posts = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedPost: (state, action: PayloadAction<BlogPost | null>) => {
      state.selectedPost = action.payload
    },
    setFeaturedPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.featuredPosts = action.payload
    },
    setPopularPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.popularPosts = action.payload
    },
    setRecentPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.recentPosts = action.payload
    },
    setRelatedPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.relatedPosts = action.payload
    },
    setComments: (state, action: PayloadAction<BlogComment[]>) => {
      state.comments = action.payload
    },
    setCategories: (state, action: PayloadAction<BlogCategory[]>) => {
      state.categories = action.payload
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setFilters: (state, action: PayloadAction<Partial<BlogState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action: PayloadAction<Partial<BlogState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.unshift(action.payload)
    },
    updatePost: (state, action: PayloadAction<BlogPost>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }
      if (state.selectedPost?.id === action.payload.id) {
        state.selectedPost = action.payload
      }
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload)
      if (state.selectedPost?.id === action.payload) {
        state.selectedPost = null
      }
    },
    likePost: (state, action: PayloadAction<string>) => {
      const updateLike = (post: BlogPost) => {
        if (post.isLiked) {
          post.likes--
          post.isLiked = false
        } else {
          post.likes++
          post.isLiked = true
        }
      }

      const post = state.posts.find(p => p.id === action.payload)
      if (post) updateLike(post)
      
      if (state.selectedPost?.id === action.payload) {
        updateLike(state.selectedPost)
      }
    },
    incrementViews: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload)
      if (post) post.views++
      
      if (state.selectedPost?.id === action.payload) {
        state.selectedPost.views++
      }
    },
    addComment: (state, action: PayloadAction<BlogComment>) => {
      state.comments.unshift(action.payload)
      
      const post = state.posts.find(p => p.id === action.payload.postId)
      if (post) post.commentsCount++
      
      if (state.selectedPost?.id === action.payload.postId) {
        state.selectedPost.commentsCount++
      }
    },
    updateComment: (state, action: PayloadAction<BlogComment>) => {
      const index = state.comments.findIndex(comment => comment.id === action.payload.id)
      if (index !== -1) {
        state.comments[index] = action.payload
      }
    },
    removeComment: (state, action: PayloadAction<{ commentId: string; postId: string }>) => {
      state.comments = state.comments.filter(comment => comment.id !== action.payload.commentId)
      
      const post = state.posts.find(p => p.id === action.payload.postId)
      if (post) post.commentsCount--
      
      if (state.selectedPost?.id === action.payload.postId) {
        state.selectedPost.commentsCount--
      }
    },
    likeComment: (state, action: PayloadAction<string>) => {
      const comment = state.comments.find(c => c.id === action.payload)
      if (comment) {
        if (comment.isLiked) {
          comment.likes--
          comment.isLiked = false
        } else {
          comment.likes++
          comment.isLiked = true
        }
      }
    }
  }
})

export const {
  setPosts,
  setSelectedPost,
  setFeaturedPosts,
  setPopularPosts,
  setRecentPosts,
  setRelatedPosts,
  setComments,
  setCategories,
  setTags,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  addPost,
  updatePost,
  removePost,
  likePost,
  incrementViews,
  addComment,
  updateComment,
  removeComment,
  likeComment
} = blogSlice.actions

export default blogSlice.reducer