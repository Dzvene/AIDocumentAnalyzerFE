import axiosInstance from './axios';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  email_verified: boolean;
  is_active: boolean;
  account_balance: number;
  currency: string;
  created_at: string;
  last_login?: string;
  documents_count: number;
  analyses_count: number;
  total_spent: number;
  language: string;
  notifications_enabled: boolean;
}

export interface Transaction {
  id: number;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'analysis' | 'refund' | 'bonus';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  balance_before: number;
  balance_after: number;
  currency: string;
  description?: string;
  reference?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisHistoryItem {
  id: number;
  document_name: string;
  document_type?: string;
  document_size?: number;
  page_count?: number;
  analysis_type?: string;
  cost: number;
  summary?: string;
  created_at: string;
  risks?: any[];
  recommendations?: any[];
  key_points?: any[];
  full_analysis?: any;
  processing_time?: number;
  ai_model?: string;
  language?: string;
}

export interface UserStatistics {
  total_analyses: number;
  total_documents: number;
  total_pages: number;
  total_spent: number;
  total_deposited: number;
  analyses_this_month: number;
  analyses_this_week: number;
  spent_this_month: number;
  spent_this_week: number;
  favorite_document_types?: Array<{ type: string; count: number }>;
  average_document_size?: number;
  average_processing_time?: number;
  last_analysis_at?: string;
  last_deposit_at?: string;
}

export const profileApi = {
  // Profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/profile/me');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await axiosInstance.patch('/profile/me', data);
    return response.data;
  },

  // Balance
  getBalance: async () => {
    const response = await axiosInstance.get('/profile/balance');
    return response.data;
  },

  topUpBalance: async (amount: number, paymentMethod: string = 'card') => {
    const response = await axiosInstance.post('/profile/balance/topup', {
      amount,
      payment_method: paymentMethod
    });
    return response.data;
  },

  // Transactions
  getTransactions: async (params?: {
    skip?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<Transaction[]> => {
    const response = await axiosInstance.get('/profile/transactions', { params });
    return response.data;
  },

  // Analysis History
  getAnalysisHistory: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<AnalysisHistoryItem[]> => {
    const response = await axiosInstance.get('/profile/history', { params });
    return response.data;
  },

  getAnalysisDetail: async (historyId: number): Promise<AnalysisHistoryItem> => {
    const response = await axiosInstance.get(`/profile/history/${historyId}`);
    return response.data;
  },

  exportAnalysisToPDF: async (historyId: number): Promise<Blob> => {
    const response = await axiosInstance.get(`/profile/history/${historyId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  deleteAnalysisHistory: async (historyId: number) => {
    const response = await axiosInstance.delete(`/profile/history/${historyId}`);
    return response.data;
  },

  // Statistics
  getStatistics: async (): Promise<UserStatistics> => {
    const response = await axiosInstance.get('/profile/statistics');
    return response.data;
  },

  refreshStatistics: async (): Promise<UserStatistics> => {
    const response = await axiosInstance.post('/profile/statistics/refresh');
    return response.data;
  }
};