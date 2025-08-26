// Export all API services
export { authAPI } from './auth.api';
export { documentsAPI } from './documents.api';
export { analysisAPI } from './analysis.api';

// Export types
export type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
} from './auth.api';

export type {
  Document,
  DocumentUploadRequest,
  DocumentListRequest,
  DocumentListResponse,
  DocumentSearchRequest,
  DocumentProcessingStatus,
  BulkUploadResponse,
} from './documents.api';

export {
  DocumentType,
  DocumentStatus,
} from './documents.api';

export type {
  Analysis,
  AnalysisRequest,
  BulkAnalysisRequest,
  AnalysisListRequest,
  AnalysisListResponse,
  AnalysisStatistics,
  AnalysisCostEstimate,
  RiskItem,
  PositiveClause,
} from './analysis.api';

export {
  AIProvider,
  AnalysisStatus,
  RiskLevel,
} from './analysis.api';

// Export utilities
export { default as axiosInstance, handleApiError, createFormData } from './axios';
export type { ApiError } from './axios';