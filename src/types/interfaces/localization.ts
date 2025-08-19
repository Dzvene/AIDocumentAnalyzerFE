// Enums based on backend
export enum ResourceType {
  Text = 0,
  Html = 1,
  Markdown = 2,
  Json = 3,
  Xml = 4,
  Csv = 5,
  Binary = 6
}

export enum ResourceScope {
  Global = 0,
  Module = 1,
  Page = 2,
  Component = 3,
  Feature = 4,
  API = 5,
  Email = 6,
  SMS = 7,
  Push = 8,
  Report = 9
}

export enum TranslationStatus {
  Draft = 0,
  InProgress = 1,
  Completed = 2,
  Review = 3,
  Approved = 4,
  Published = 5,
  Archived = 6
}

export enum TranslationProvider {
  Manual = 0,
  Google = 1,
  Azure = 2,
  AWS = 3,
  DeepL = 4,
  OpenAI = 5
}

export enum TextDirection {
  LTR = 0,
  RTL = 1
}

// Main interfaces
export interface LocalizationResource {
  id: string
  key: string
  defaultValue?: string
  type: ResourceType
  scope: ResourceScope
  module?: string
  category?: string
  description?: string
  hasPlural: boolean
  variables?: string[]
  isActive: boolean
  createdAt: string
  updatedAt?: string
  translations?: LocalizationTranslation[]
}

export interface LocalizationTranslation {
  id: string
  resourceId: string
  cultureCode: string
  value?: string
  status: TranslationStatus
  isApproved: boolean
  isPublished: boolean
  isAutoTranslated: boolean
  quality?: number
  provider?: TranslationProvider
  createdAt: string
  updatedAt?: string
}

export interface Culture {
  id: string
  code: string // en-US, ru-RU, etc.
  name: string // Display name
  nativeName: string // Native name
  languageCode: string // en, ru, etc.
  countryCode?: string // US, RU, etc.
  textDirection: TextDirection
  isActive: boolean
  isDefault: boolean
  translationCoverage: number // 0-100%
}

// Request/Response DTOs
export interface CreateResourceRequest {
  key: string
  defaultValue?: string
  type: ResourceType
  scope: ResourceScope
  module?: string
  category?: string
  description?: string
  hasPlural?: boolean
  variables?: string[]
  isRequired?: boolean
}

export interface UpdateResourceRequest {
  id: string
  key?: string
  defaultValue?: string
  type?: ResourceType
  scope?: ResourceScope
  module?: string
  category?: string
  description?: string
  hasPlural?: boolean
  variables?: string[]
  isActive?: boolean
}

export interface CreateTranslationRequest {
  resourceId: string
  cultureCode: string
  value: string
  markAsReviewed?: boolean
  comment?: string
}

export interface UpdateTranslationRequest {
  id: string
  value?: string
  status?: TranslationStatus
  isApproved?: boolean
  isPublished?: boolean
  comment?: string
}

export interface ResourcesListResponse {
  resources: LocalizationResource[]
  totalCount: number
  page: number
  pageSize: number
}

export interface TranslationsListResponse {
  translations: LocalizationTranslation[]
  totalCount: number
  page: number
  pageSize: number
}

export interface ResourceFilters {
  search?: string
  module?: string
  category?: string
  scope?: ResourceScope
  type?: ResourceType
  isActive?: boolean
  hasTranslations?: boolean
  cultureCode?: string // Filter by culture that has translations
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface TranslationFilters {
  search?: string
  resourceId?: string
  cultureCode?: string
  status?: TranslationStatus
  isApproved?: boolean
  isPublished?: boolean
  isAutoTranslated?: boolean
  minQuality?: number
  provider?: TranslationProvider
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

// Bulk operations
export interface BulkCreateTranslationsRequest {
  translations: CreateTranslationRequest[]
}

export interface BulkUpdateTranslationsRequest {
  translations: UpdateTranslationRequest[]
}

// Import/Export
export interface ExportTranslationsRequest {
  cultureCode?: string
  format: 'json' | 'csv' | 'excel' | 'resx'
  includeEmpty?: boolean
  modules?: string[]
  categories?: string[]
}

export interface ImportTranslationsRequest {
  cultureCode: string
  format: 'json' | 'csv' | 'excel' | 'resx'
  data: string | File
  overwriteExisting?: boolean
  markAsReviewed?: boolean
}

// Statistics
export interface LocalizationStats {
  totalResources: number
  totalTranslations: number
  cultures: Array<{
    code: string
    name: string
    totalTranslations: number
    approvedTranslations: number
    coverage: number
  }>
  modules: Array<{
    name: string
    totalResources: number
    translatedResources: number
    coverage: number
  }>
  recentActivity: Array<{
    type: 'resource_created' | 'translation_added' | 'translation_approved'
    resourceKey: string
    cultureCode?: string
    timestamp: string
  }>
}

// Client-side localization
export interface LocalizedStrings {
  [key: string]: string
}

export interface LocalizationContextValue {
  currentCulture: string
  availableCultures: Culture[]
  strings: LocalizedStrings
  t: (key: string, variables?: Record<string, string>) => string
  changeCulture: (cultureCode: string) => void
  isLoading: boolean
}