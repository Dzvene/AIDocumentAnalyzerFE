import { apiClient } from './config'
import type {
  LocalizationResource,
  LocalizationTranslation,
  Culture,
  CreateResourceRequest,
  UpdateResourceRequest,
  CreateTranslationRequest,
  UpdateTranslationRequest,
  ResourcesListResponse,
  TranslationsListResponse,
  ResourceFilters,
  TranslationFilters,
  BulkCreateTranslationsRequest,
  BulkUpdateTranslationsRequest,
  ExportTranslationsRequest,
  ImportTranslationsRequest,
  LocalizationStats,
  LocalizedStrings
} from '@types/interfaces/localization'

export const localizationApi = {
  // Resources
  getResources: async (filters?: ResourceFilters): Promise<ResourcesListResponse> => {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.module) params.append('module', filters.module)
      if (filters.category) params.append('category', filters.category)
      if (filters.scope !== undefined) params.append('scope', filters.scope.toString())
      if (filters.type !== undefined) params.append('type', filters.type.toString())
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters.hasTranslations !== undefined) params.append('hasTranslations', filters.hasTranslations.toString())
      if (filters.cultureCode) params.append('cultureCode', filters.cultureCode)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<ResourcesListResponse>(`/localization/resources${query}`)
  },

  getResourceById: async (id: string): Promise<LocalizationResource> => {
    return apiClient.get<LocalizationResource>(`/localization/resources/${id}`)
  },

  getResourceByKey: async (key: string): Promise<LocalizationResource> => {
    return apiClient.get<LocalizationResource>(`/localization/resources/by-key/${encodeURIComponent(key)}`)
  },

  createResource: async (data: CreateResourceRequest): Promise<LocalizationResource> => {
    return apiClient.post<LocalizationResource>('/localization/resources', data)
  },

  updateResource: async (data: UpdateResourceRequest): Promise<LocalizationResource> => {
    return apiClient.put<LocalizationResource>(`/localization/resources/${data.id}`, data)
  },

  deleteResource: async (id: string): Promise<void> => {
    return apiClient.delete(`/localization/resources/${id}`)
  },

  // Translations
  getTranslations: async (filters?: TranslationFilters): Promise<TranslationsListResponse> => {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.resourceId) params.append('resourceId', filters.resourceId)
      if (filters.cultureCode) params.append('cultureCode', filters.cultureCode)
      if (filters.status !== undefined) params.append('status', filters.status.toString())
      if (filters.isApproved !== undefined) params.append('isApproved', filters.isApproved.toString())
      if (filters.isPublished !== undefined) params.append('isPublished', filters.isPublished.toString())
      if (filters.isAutoTranslated !== undefined) params.append('isAutoTranslated', filters.isAutoTranslated.toString())
      if (filters.minQuality) params.append('minQuality', filters.minQuality.toString())
      if (filters.provider !== undefined) params.append('provider', filters.provider.toString())
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<TranslationsListResponse>(`/localization/translations${query}`)
  },

  getTranslationById: async (id: string): Promise<LocalizationTranslation> => {
    return apiClient.get<LocalizationTranslation>(`/localization/translations/${id}`)
  },

  createTranslation: async (data: CreateTranslationRequest): Promise<LocalizationTranslation> => {
    return apiClient.post<LocalizationTranslation>('/localization/translations', data)
  },

  updateTranslation: async (data: UpdateTranslationRequest): Promise<LocalizationTranslation> => {
    return apiClient.put<LocalizationTranslation>(`/localization/translations/${data.id}`, data)
  },

  deleteTranslation: async (id: string): Promise<void> => {
    return apiClient.delete(`/localization/translations/${id}`)
  },

  approveTranslation: async (id: string): Promise<LocalizationTranslation> => {
    return apiClient.post<LocalizationTranslation>(`/localization/translations/${id}/approve`)
  },

  rejectTranslation: async (id: string, comment?: string): Promise<LocalizationTranslation> => {
    return apiClient.post<LocalizationTranslation>(`/localization/translations/${id}/reject`, { comment })
  },

  // Bulk operations
  createTranslationsBulk: async (data: BulkCreateTranslationsRequest): Promise<LocalizationTranslation[]> => {
    return apiClient.post<LocalizationTranslation[]>('/localization/translations/bulk', data)
  },

  updateTranslationsBulk: async (data: BulkUpdateTranslationsRequest): Promise<LocalizationTranslation[]> => {
    return apiClient.put<LocalizationTranslation[]>('/localization/translations/bulk', data)
  },

  // Cultures
  getCultures: async (): Promise<Culture[]> => {
    return apiClient.get<Culture[]>('/localization/cultures')
  },

  getCultureByCode: async (code: string): Promise<Culture> => {
    return apiClient.get<Culture>(`/localization/cultures/${code}`)
  },

  createCulture: async (data: Omit<Culture, 'id' | 'translationCoverage'>): Promise<Culture> => {
    return apiClient.post<Culture>('/localization/cultures', data)
  },

  updateCulture: async (code: string, data: Partial<Culture>): Promise<Culture> => {
    return apiClient.put<Culture>(`/localization/cultures/${code}`, data)
  },

  // Localized strings (for app consumption)
  getLocalizedString: async (key: string, cultureCode?: string): Promise<string> => {
    const culture = cultureCode ? `?culture=${cultureCode}` : ''
    return apiClient.get<string>(`/localization/string/${encodeURIComponent(key)}${culture}`)
  },

  getLocalizedStrings: async (cultureCode: string): Promise<LocalizedStrings> => {
    return apiClient.get<LocalizedStrings>(`/localization/strings?culture=${cultureCode}`)
  },

  // Cache management
  invalidateCache: async (): Promise<void> => {
    return apiClient.post('/localization/invalidate-cache')
  },

  // Import/Export
  exportTranslations: async (request: ExportTranslationsRequest): Promise<Blob> => {
    const response = await apiClient.post('/localization/export', request, {
      responseType: 'blob'
    })
    return response as Blob
  },

  importTranslations: async (request: ImportTranslationsRequest): Promise<{ imported: number; updated: number; errors: string[] }> => {
    const formData = new FormData()
    formData.append('cultureCode', request.cultureCode)
    formData.append('format', request.format)
    
    if (request.data instanceof File) {
      formData.append('file', request.data)
    } else {
      formData.append('data', request.data)
    }
    
    if (request.overwriteExisting) {
      formData.append('overwriteExisting', request.overwriteExisting.toString())
    }
    
    if (request.markAsReviewed) {
      formData.append('markAsReviewed', request.markAsReviewed.toString())
    }

    return apiClient.post('/localization/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Statistics
  getStats: async (): Promise<LocalizationStats> => {
    return apiClient.get<LocalizationStats>('/localization/stats')
  },

  // Auto-translation
  autoTranslate: async (resourceId: string, targetCultures: string[], provider?: string): Promise<LocalizationTranslation[]> => {
    return apiClient.post<LocalizationTranslation[]>('/localization/auto-translate', {
      resourceId,
      targetCultures,
      provider
    })
  },

  // Search and suggestions
  searchResources: async (query: string, limit?: number): Promise<LocalizationResource[]> => {
    return apiClient.get<LocalizationResource[]>(`/localization/search/resources?q=${encodeURIComponent(query)}&limit=${limit || 10}`)
  },

  getSimilarKeys: async (key: string, limit?: number): Promise<string[]> => {
    return apiClient.get<string[]>(`/localization/suggestions/keys?key=${encodeURIComponent(key)}&limit=${limit || 5}`)
  }
}