import axios from './axios';

// Types
export interface GlossaryTermTranslation {
  id: number;
  term_id: number;
  language: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTerm {
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations: GlossaryTermTranslation[];
}


export interface GlossaryTermListResponse {
  items: GlossaryTerm[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface GlossarySearchRequest {
  query: string;
  language: string;
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
  total_searches: number;
  popular_terms: Array<{ id: number; views: number }>;
  recent_searches: Array<{
    term: string;
    language: string;
    results: number;
    date: string;
  }>;
}

// API functions
export const glossaryApi = {
  // List terms with pagination and filtering
  listTerms: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language?: string;
  }): Promise<GlossaryTermListResponse> => {
    const response = await axios.get('/glossary/terms', { params });
    return response.data;
  },

  // Get a specific term by ID
  getTerm: async (termId: number): Promise<GlossaryTerm> => {
    const response = await axios.get(`/glossary/terms/${termId}`);
    return response.data;
  },


  // Search terms
  searchTerms: async (searchRequest: GlossarySearchRequest): Promise<GlossarySearchResponse> => {
    const response = await axios.post('/glossary/search', searchRequest);
    return response.data;
  },


  // Get glossary statistics
  getStats: async (): Promise<GlossaryStats> => {
    const response = await axios.get('/glossary/stats');
    return response.data;
  },

  // Admin functions
  createTerm: async (termData: {
    is_active?: boolean;
    translations: Array<{
      language: string;
      title: string;
      description: string;
    }>;
  }): Promise<GlossaryTerm> => {
    const response = await axios.post('/glossary/terms', termData);
    return response.data;
  },

  updateTerm: async (
    termId: number,
    updateData: Partial<{
      is_active: boolean;
    }>
  ): Promise<GlossaryTerm> => {
    const response = await axios.put(`/glossary/terms/${termId}`, updateData);
    return response.data;
  },

  deleteTerm: async (termId: number): Promise<void> => {
    await axios.delete(`/glossary/terms/${termId}`);
  },

  addTranslation: async (
    termId: number,
    translation: {
      language: string;
      title: string;
      description: string;
    }
  ): Promise<GlossaryTermTranslation> => {
    const response = await axios.post(`/glossary/terms/${termId}/translations`, translation);
    return response.data;
  },

  updateTranslation: async (
    translationId: number,
    updateData: Partial<{
      title: string;
      description: string;
    }>
  ): Promise<GlossaryTermTranslation> => {
    const response = await axios.put(`/glossary/translations/${translationId}`, updateData);
    return response.data;
  },

  deleteTranslation: async (translationId: number): Promise<void> => {
    await axios.delete(`/glossary/translations/${translationId}`);
  }
};