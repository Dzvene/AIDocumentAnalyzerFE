// Backend DTOs for Categories module
import { ApiResponse } from './auth.dto'

export interface CategoryDto {
  id: string
  name: string
  nameEn: string
  slug?: string
  imageUrl?: string
  description?: string
  iconName?: string
  colorCode?: string
  sortOrder: number
  displayOrder: number
  isActive: boolean
  parentCategoryId?: string
  parentId?: string
  searchTags?: string // JSON array string
  parentCategory?: CategoryDto
  subCategories?: CategoryDto[]
  createdAt: string
  updatedAt?: string
}

export interface CreateCategoryRequest {
  name: string
  nameEn: string
  slug?: string
  imageUrl?: string
  description?: string
  iconName?: string
  colorCode?: string
  sortOrder?: number
  isActive?: boolean
  parentCategoryId?: string
  searchTags?: string
}

export interface UpdateCategoryRequest {
  name?: string
  nameEn?: string
  slug?: string
  imageUrl?: string
  description?: string
  iconName?: string
  colorCode?: string
  sortOrder?: number
  isActive?: boolean
  parentCategoryId?: string
  searchTags?: string
}

export interface CategoryListRequest {
  search?: string
  parentId?: string
  isActive?: boolean
  includeSubcategories?: boolean
  sortBy?: string
  sortDescending?: boolean
  page?: number
  pageSize?: number
}

export interface CategoryTreeRequest {
  parentId?: string
  maxDepth?: number
  includeInactive?: boolean
}

export interface CategoryStats {
  totalCategories: number
  activeCategories: number
  rootCategories: number
  leafCategories: number
  categoryDepth: number
  categoriesByLevel: Record<number, number>
  productsPerCategory: Record<string, number>
}

// Response types
export interface CategoryListResponse extends ApiResponse<{
  categories: CategoryDto[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface CategoryResponse extends ApiResponse<CategoryDto> {}

export interface CategoryTreeResponse extends ApiResponse<CategoryDto[]> {}

export interface CategoryStatsResponse extends ApiResponse<CategoryStats> {}

export interface BulkCategoryResponse extends ApiResponse<{
  updated?: CategoryDto[]
  created?: CategoryDto[]
  deleted?: string[]
  errors?: Array<{ id: string; error: string }>
}> {}