import axiosInstance, { handleApiError } from './axios';

// Enums
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Types
export interface RiskItem {
  id: string;
  type: string;
  level: RiskLevel;
  title: string;
  description: string;
  recommendation: string;
  location?: string;
  confidence: number;
}

export interface PositiveClause {
  id: string;
  type: string;
  title: string;
  description: string;
  benefit: string;
  location?: string;
  confidence: number;
}

export interface Analysis {
  id: string;
  document_id: string;
  status: AnalysisStatus;
  ai_provider: AIProvider;
  started_at: string;
  completed_at?: string;
  processing_time_seconds?: number;
  risks?: RiskItem[];
  positive_clauses?: PositiveClause[];
  summary?: string;
  recommendations?: string[];
  overall_risk_level?: RiskLevel;
  confidence_score?: number;
  cost?: number;
  metadata?: Record<string, any>;
}

export interface AnalysisRequest {
  document_id: string;
  ai_provider?: AIProvider;
  analyze_risks?: boolean;
  analyze_positive?: boolean;
  generate_report?: boolean;
}

export interface BulkAnalysisRequest {
  document_ids: string[];
  ai_provider?: AIProvider;
  analyze_risks?: boolean;
  analyze_positive?: boolean;
  generate_report?: boolean;
}

export interface AnalysisListRequest {
  page?: number;
  per_page?: number;
  status?: AnalysisStatus;
  document_id?: string;
}

export interface AnalysisListResponse {
  analyses: Analysis[];
  total: number;
  page: number;
  per_page: number;
}

export interface AnalysisStatistics {
  total_analyses: number;
  completed_analyses: number;
  failed_analyses: number;
  average_processing_time: number;
  total_risks_found: number;
  total_positive_clauses: number;
  risk_distribution: Record<RiskLevel, number>;
  provider_usage: Record<AIProvider, number>;
  total_cost: number;
}

export interface AnalysisCostEstimate {
  document_id: string;
  estimated_cost: number;
  estimated_time_seconds: number;
  ai_provider: AIProvider;
  page_count: number;
}

// API Service
class AnalysisAPI {
  private basePath = '/api/analysis';

  /**
   * Start document analysis
   */
  async analyzeDocument(request: AnalysisRequest): Promise<Analysis> {
    try {
      const response = await axiosInstance.post<Analysis>(
        `${this.basePath}/analyze`,
        {
          ...request,
          ai_provider: request.ai_provider || AIProvider.OPENAI,
          analyze_risks: request.analyze_risks !== false,
          analyze_positive: request.analyze_positive !== false,
          generate_report: request.generate_report !== false,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Bulk analyze multiple documents
   */
  async bulkAnalyze(request: BulkAnalysisRequest): Promise<Analysis[]> {
    try {
      const response = await axiosInstance.post<{ analyses: Analysis[] }>(
        `${this.basePath}/analyze/bulk`,
        {
          ...request,
          ai_provider: request.ai_provider || AIProvider.OPENAI,
          analyze_risks: request.analyze_risks !== false,
          analyze_positive: request.analyze_positive !== false,
          generate_report: request.generate_report !== false,
        }
      );
      return response.data.analyses;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get list of analyses
   */
  async getAnalyses(params?: AnalysisListRequest): Promise<AnalysisListResponse> {
    try {
      const response = await axiosInstance.get<AnalysisListResponse>(
        this.basePath,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single analysis details
   */
  async getAnalysis(analysisId: string): Promise<Analysis> {
    try {
      const response = await axiosInstance.get<Analysis>(
        `${this.basePath}/${analysisId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get analysis for a specific document
   */
  async getDocumentAnalysis(documentId: string): Promise<Analysis | null> {
    try {
      const response = await axiosInstance.get<Analysis>(
        `${this.basePath}/document/${documentId}`
      );
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw handleApiError(error);
    }
  }

  /**
   * Get analysis status
   */
  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus> {
    try {
      const response = await axiosInstance.get<{ status: AnalysisStatus }>(
        `${this.basePath}/${analysisId}/status`
      );
      return response.data.status;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get cost estimate for analysis
   */
  async getCostEstimate(documentId: string, aiProvider?: AIProvider): Promise<AnalysisCostEstimate> {
    try {
      const response = await axiosInstance.get<AnalysisCostEstimate>(
        `${this.basePath}/estimate`,
        {
          params: {
            document_id: documentId,
            ai_provider: aiProvider || AIProvider.OPENAI,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get analysis statistics
   */
  async getStatistics(dateFrom?: string, dateTo?: string): Promise<AnalysisStatistics> {
    try {
      const response = await axiosInstance.get<AnalysisStatistics>(
        `${this.basePath}/statistics`,
        {
          params: {
            date_from: dateFrom,
            date_to: dateTo,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Download analysis report
   */
  async downloadReport(analysisId: string, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> {
    try {
      const response = await axiosInstance.get(
        `${this.basePath}/${analysisId}/report`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cancel ongoing analysis
   */
  async cancelAnalysis(analysisId: string): Promise<void> {
    try {
      await axiosInstance.post(`${this.basePath}/${analysisId}/cancel`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Retry failed analysis
   */
  async retryAnalysis(analysisId: string): Promise<Analysis> {
    try {
      const response = await axiosInstance.post<Analysis>(
        `${this.basePath}/${analysisId}/retry`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const analysisAPI = new AnalysisAPI();