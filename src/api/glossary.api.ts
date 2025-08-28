import axios from './axios';

// Types
export interface GlossaryTermTranslation {
  id: number;
  term_id: number;
  language: string;
  title: string;
  short_description: string;
  full_description: string;
  usage_examples?: string;
  synonyms?: string;
  abbreviations?: string;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTerm {
  id: number;
  slug: string;
  category?: string;
  is_active: boolean;
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  translations: GlossaryTermTranslation[];
  related_terms?: any[];
}

export interface GlossaryCategory {
  id: number;
  slug: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  translations: GlossaryCategoryTranslation[];
  parent?: GlossaryCategory;
}

export interface GlossaryCategoryTranslation {
  id: number;
  category_id: number;
  language: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTermListResponse {
  items: GlossaryTerm[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface GlossaryCategoryListResponse {
  items: GlossaryCategory[];
  total: number;
}

export interface GlossarySearchRequest {
  query: string;
  language: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface GlossarySearchResponse {
  results: GlossaryTerm[];
  total: number;
  query: string;
  language: string;
}

export interface GlossaryStats {
  total_terms: number;
  total_categories: number;
  total_searches: number;
  popular_terms: Array<{ slug: string; views: number }>;
  recent_searches: Array<{
    term: string;
    language: string;
    results: number;
    date: string;
  }>;
  terms_by_category: Record<string, number>;
}

// API functions
export const glossaryApi = {
  // List terms with pagination and filtering
  listTerms: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    language?: string;
  }): Promise<GlossaryTermListResponse> => {
    const response = await axios.get('/api/glossary/terms', { params });
    return response.data;
  },

  // Get a specific term by ID
  getTerm: async (termId: number): Promise<GlossaryTerm> => {
    const response = await axios.get(`/api/glossary/terms/${termId}`);
    return response.data;
  },

  // Get a term by slug
  getTermBySlug: async (slug: string): Promise<GlossaryTerm> => {
    const response = await axios.get(`/api/glossary/terms/slug/${slug}`);
    return response.data;
  },

  // Search terms
  searchTerms: async (searchRequest: GlossarySearchRequest): Promise<GlossarySearchResponse> => {
    const response = await axios.post('/api/glossary/search', searchRequest);
    return response.data;
  },

  // List categories
  listCategories: async (): Promise<GlossaryCategoryListResponse> => {
    const response = await axios.get('/api/glossary/categories');
    return response.data;
  },

  // Get category by ID
  getCategory: async (categoryId: number): Promise<GlossaryCategory> => {
    const response = await axios.get(`/api/glossary/categories/${categoryId}`);
    return response.data;
  },

  // Get glossary statistics
  getStats: async (): Promise<GlossaryStats> => {
    const response = await axios.get('/api/glossary/stats');
    return response.data;
  },

  // Admin functions
  createTerm: async (termData: {
    slug: string;
    category?: string;
    is_active?: boolean;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    translations: Array<{
      language: string;
      title: string;
      short_description: string;
      full_description: string;
      usage_examples?: string;
      synonyms?: string;
      abbreviations?: string;
    }>;
  }): Promise<GlossaryTerm> => {
    const response = await axios.post('/api/glossary/terms', termData);
    return response.data;
  },

  updateTerm: async (
    termId: number,
    updateData: Partial<{
      slug: string;
      category: string;
      is_active: boolean;
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
    }>
  ): Promise<GlossaryTerm> => {
    const response = await axios.put(`/api/glossary/terms/${termId}`, updateData);
    return response.data;
  },

  deleteTerm: async (termId: number): Promise<void> => {
    await axios.delete(`/api/glossary/terms/${termId}`);
  },

  addTranslation: async (
    termId: number,
    translation: {
      language: string;
      title: string;
      short_description: string;
      full_description: string;
      usage_examples?: string;
      synonyms?: string;
      abbreviations?: string;
    }
  ): Promise<GlossaryTermTranslation> => {
    const response = await axios.post(`/api/glossary/terms/${termId}/translations`, translation);
    return response.data;
  },

  updateTranslation: async (
    translationId: number,
    updateData: Partial<{
      title: string;
      short_description: string;
      full_description: string;
      usage_examples: string;
      synonyms: string;
      abbreviations: string;
    }>
  ): Promise<GlossaryTermTranslation> => {
    const response = await axios.put(`/api/glossary/translations/${translationId}`, updateData);
    return response.data;
  },

  deleteTranslation: async (translationId: number): Promise<void> => {
    await axios.delete(`/api/glossary/translations/${translationId}`);
  },

  createCategory: async (categoryData: {
    slug: string;
    parent_id?: number;
    is_active?: boolean;
    sort_order?: number;
    translations: Array<{
      language: string;
      name: string;
      description?: string;
    }>;
  }): Promise<GlossaryCategory> => {
    const response = await axios.post('/api/glossary/categories', categoryData);
    return response.data;
  },

  updateCategory: async (
    categoryId: number,
    updateData: Partial<{
      slug: string;
      parent_id: number;
      is_active: boolean;
      sort_order: number;
    }>
  ): Promise<GlossaryCategory> => {
    const response = await axios.put(`/api/glossary/categories/${categoryId}`, updateData);
    return response.data;
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    await axios.delete(`/api/glossary/categories/${categoryId}`);
  }
};