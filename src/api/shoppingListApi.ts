import axios from 'axios'
import { 
  ShoppingListItem, 
  ShopMatch, 
  MatchedProduct 
} from '@store/slices/shoppingListSlice'
import { Coordinates } from '@store/slices/locationSlice'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

export interface MatchShoppingListRequest {
  items: ShoppingListItem[]
  location: Coordinates
  radius?: number
  maxShops?: number
  includeClosedShops?: boolean
  priceRange?: {
    min?: number
    max?: number
  }
}

export interface MatchShoppingListResponse {
  matches: ShopMatch[]
  bestMatch: ShopMatch | null
  cheapestOption: ShopMatch | null
  closestOption: ShopMatch | null
  statistics: {
    totalShopsAnalyzed: number
    averageMatchPercentage: number
    averagePrice: number
    priceRange: {
      min: number
      max: number
    }
  }
}

export interface OptimizeListRequest {
  items: ShoppingListItem[]
  location: Coordinates
  optimizeBy: 'price' | 'distance' | 'time' | 'combined'
  maxShops?: number
  maxDeliveryFee?: number
  preferredShops?: string[]
}

export interface OptimizeListResponse {
  optimizedMatches: ShopMatch[]
  cheapestCombination: {
    shops: ShopMatch[]
    totalCost: number
    totalDeliveryFee: number
    totalSavings: number
  }
  recommendation: {
    type: 'single_shop' | 'multiple_shops'
    reason: string
    shops: string[]
  }
}

export interface SaveListRequest {
  name: string
  items: ShoppingListItem[]
  isTemplate?: boolean
  tags?: string[]
}

export interface SavedList {
  id: string
  name: string
  items: ShoppingListItem[]
  isTemplate: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  usageCount: number
}

export interface ImportReceiptRequest {
  receipt: File
  parseMode?: 'ocr' | 'ai' | 'hybrid'
}

export interface ImportReceiptResponse {
  items: ShoppingListItem[]
  confidence: number
  unrecognizedText: string[]
  totalAmount?: number
  shopName?: string
  date?: string
}

export interface GetSuggestionsResponse {
  suggestions: {
    name: string
    category: string
    commonUnit: string
    averagePrice: number
    popularity: number
  }[]
}

export interface ShareListResponse {
  shareUrl: string
  shareCode: string
  qrCode: string
  expiresAt: string
}

export interface ImportSharedListResponse {
  list: SavedList
  owner?: {
    name: string
    avatar?: string
  }
  importedAt: string
}

export interface ListTemplatesResponse {
  templates: {
    id: string
    name: string
    description: string
    category: string
    itemsCount: number
    items: ShoppingListItem[]
    tags: string[]
    usageCount: number
    rating: number
  }[]
  categories: string[]
}

export interface PredictiveListResponse {
  predictedItems: {
    item: ShoppingListItem
    confidence: number
    reason: 'frequently_bought' | 'seasonal' | 'running_low' | 'routine'
  }[]
  basedOn: {
    orderHistory: boolean
    timePatterns: boolean
    seasonalTrends: boolean
  }
}

export interface CompareListPricesRequest {
  items: ShoppingListItem[]
  shopIds: string[]
  location: Coordinates
}

export interface CompareListPricesResponse {
  comparison: {
    shopId: string
    shopName: string
    availableItems: number
    totalItems: number
    subtotal: number
    deliveryFee: number
    total: number
    savings: number
    missingItems: string[]
  }[]
  bestValue: {
    shopId: string
    reason: string
  }
}

export interface ListAnalyticsResponse {
  itemFrequency: {
    [itemName: string]: {
      count: number
      lastAdded: string
      averageQuantity: number
    }
  }
  categories: {
    [category: string]: number
  }
  averageListSize: number
  averageListValue: number
  mostCommonItems: string[]
}

export interface VoiceToListRequest {
  audio: Blob
  language?: string
}

export interface VoiceToListResponse {
  items: ShoppingListItem[]
  transcription: string
  confidence: number
  corrections: {
    original: string
    corrected: string
  }[]
}

class ShoppingListApi {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async matchShoppingList(request: MatchShoppingListRequest): Promise<MatchShoppingListResponse> {
    const { data } = await this.axiosInstance.post('/shopping-list/match', request)
    return data
  }

  async optimizeList(request: OptimizeListRequest): Promise<OptimizeListResponse> {
    const { data } = await this.axiosInstance.post('/shopping-list/optimize', request)
    return data
  }

  async saveList(request: SaveListRequest): Promise<SavedList> {
    const { data } = await this.axiosInstance.post('/shopping-list/save', request)
    return data
  }

  async updateList(listId: string, updates: Partial<SaveListRequest>): Promise<SavedList> {
    const { data } = await this.axiosInstance.put(`/shopping-list/${listId}`, updates)
    return data
  }

  async getList(listId: string): Promise<SavedList> {
    const { data } = await this.axiosInstance.get(`/shopping-list/${listId}`)
    return data
  }

  async deleteList(listId: string): Promise<void> {
    await this.axiosInstance.delete(`/shopping-list/${listId}`)
  }

  async getUserLists(
    page = 1,
    limit = 10,
    includeTemplates = true
  ): Promise<{
    lists: SavedList[]
    total: number
    page: number
    totalPages: number
  }> {
    const { data } = await this.axiosInstance.get('/shopping-list/user', {
      params: { page, limit, includeTemplates }
    })
    return data
  }

  async importFromReceipt(request: ImportReceiptRequest): Promise<ImportReceiptResponse> {
    const formData = new FormData()
    formData.append('receipt', request.receipt)
    if (request.parseMode) {
      formData.append('parseMode', request.parseMode)
    }

    const { data } = await this.axiosInstance.post('/shopping-list/import-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  }

  async getSuggestions(query: string, category?: string): Promise<GetSuggestionsResponse> {
    const { data } = await this.axiosInstance.get('/shopping-list/suggestions', {
      params: { q: query, category }
    })
    return data
  }

  async shareList(listId: string, expiresIn = 7): Promise<ShareListResponse> {
    const { data } = await this.axiosInstance.post(`/shopping-list/${listId}/share`, {
      expiresIn
    })
    return data
  }

  async importSharedList(shareCode: string): Promise<ImportSharedListResponse> {
    const { data } = await this.axiosInstance.post('/shopping-list/import-shared', {
      shareCode
    })
    return data
  }

  async getTemplates(category?: string): Promise<ListTemplatesResponse> {
    const { data } = await this.axiosInstance.get('/shopping-list/templates', {
      params: { category }
    })
    return data
  }

  async createFromTemplate(templateId: string, customizations?: {
    name?: string
    items?: Partial<ShoppingListItem>[]
  }): Promise<SavedList> {
    const { data } = await this.axiosInstance.post('/shopping-list/from-template', {
      templateId,
      customizations
    })
    return data
  }

  async getPredictiveList(): Promise<PredictiveListResponse> {
    const { data } = await this.axiosInstance.get('/shopping-list/predictive')
    return data
  }

  async compareListPrices(request: CompareListPricesRequest): Promise<CompareListPricesResponse> {
    const { data } = await this.axiosInstance.post('/shopping-list/compare-prices', request)
    return data
  }

  async getListAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ListAnalyticsResponse> {
    const { data } = await this.axiosInstance.get('/shopping-list/analytics', {
      params: { dateFrom, dateTo }
    })
    return data
  }

  async voiceToList(request: VoiceToListRequest): Promise<VoiceToListResponse> {
    const formData = new FormData()
    formData.append('audio', request.audio)
    if (request.language) {
      formData.append('language', request.language)
    }

    const { data } = await this.axiosInstance.post('/shopping-list/voice-to-list', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  }

  async duplicateList(listId: string, newName?: string): Promise<SavedList> {
    const { data } = await this.axiosInstance.post(`/shopping-list/${listId}/duplicate`, {
      newName
    })
    return data
  }

  async mergeLists(listIds: string[], newName: string): Promise<SavedList> {
    const { data } = await this.axiosInstance.post('/shopping-list/merge', {
      listIds,
      newName
    })
    return data
  }

  async exportList(
    listId: string,
    format: 'pdf' | 'csv' | 'json' | 'text'
  ): Promise<Blob> {
    const { data } = await this.axiosInstance.get(`/shopping-list/${listId}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return data
  }

  async getFrequentItems(
    limit = 20
  ): Promise<{
    items: {
      name: string
      category: string
      frequency: number
      lastOrdered: string
      averageQuantity: number
    }[]
  }> {
    const { data } = await this.axiosInstance.get('/shopping-list/frequent-items', {
      params: { limit }
    })
    return data
  }

  async searchListHistory(
    query: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    results: {
      listId: string
      listName: string
      matchedItems: string[]
      createdAt: string
    }[]
  }> {
    const { data } = await this.axiosInstance.get('/shopping-list/search-history', {
      params: { q: query, dateFrom, dateTo }
    })
    return data
  }
}

export const shoppingListApi = new ShoppingListApi()