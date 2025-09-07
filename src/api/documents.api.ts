import axiosInstance, { createFormData, handleApiError } from './axios';

// Enums
export enum DocumentType {
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  TERMS = 'terms',
  PRIVACY_POLICY = 'privacy_policy',
  NDA = 'nda',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Types
export interface Document {
  id: string;
  original_filename: string;
  stored_filename: string;
  file_size_bytes: number;
  mime_type: string;
  document_type: DocumentType;
  status: DocumentStatus;
  language: string;
  page_count?: number;
  upload_date: string;
  processing_date?: string;
  download_url?: string;
  text_content?: string;
  metadata?: Record<string, any>;
}

export interface DocumentUploadRequest {
  file: File;
  document_type?: DocumentType;
  language?: string;
}

export interface DocumentListRequest {
  page?: number;
  per_page?: number;
  document_type?: DocumentType;
  status?: DocumentStatus;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  per_page: number;
}

export interface DocumentSearchRequest {
  query?: string;
  document_type?: DocumentType;
  status?: DocumentStatus;
  date_from?: string;
  date_to?: string;
  min_pages?: number;
  max_pages?: number;
  language?: string;
  sort_by?: 'upload_date' | 'filename' | 'size' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface DocumentProcessingStatus {
  document_id: string;
  status: DocumentStatus;
  progress: number;
  message: string;
  estimated_completion?: string;
}

export interface BulkUploadResponse {
  uploaded: Document[];
  failed: Array<{ filename: string; error: string }>;
  total_uploaded: number;
  total_failed: number;
}

// API Service
class DocumentsAPI {
  private basePath = '/api/documents';

  /**
   * Upload a single document
   */
  async uploadDocument(data: DocumentUploadRequest): Promise<Document> {
    try {
      const formData = createFormData(data.file, {
        document_type: data.document_type || DocumentType.OTHER,
        language: data.language || 'de',
      });

      const response = await axiosInstance.post<Document>(
        `${this.basePath}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Upload multiple documents
   */
  async bulkUpload(
    files: File[],
    document_type?: DocumentType,
    language?: string
  ): Promise<BulkUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      if (document_type) {
        formData.append('document_type', document_type);
      }
      if (language) {
        formData.append('language', language);
      }

      const response = await axiosInstance.post<BulkUploadResponse>(
        `${this.basePath}/bulk-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get list of documents
   */
  async getDocuments(params?: DocumentListRequest): Promise<DocumentListResponse> {
    try {
      const response = await axiosInstance.get<DocumentListResponse>(
        this.basePath,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single document details
   */
  async getDocument(documentId: string): Promise<Document> {
    try {
      const response = await axiosInstance.get<Document>(
        `${this.basePath}/${documentId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Download document file
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await axiosInstance.get(
        `${this.basePath}/${documentId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Extract text from document
   */
  async extractText(documentId: string, maxPages?: number): Promise<{ text: string }> {
    try {
      const response = await axiosInstance.get<{ document_id: string; text: string }>(
        `${this.basePath}/${documentId}/text`,
        {
          params: { max_pages: maxPages },
        }
      );
      return { text: response.data.text };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.basePath}/${documentId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get document processing status
   */
  async getDocumentStatus(documentId: string): Promise<DocumentProcessingStatus> {
    try {
      const response = await axiosInstance.get<DocumentProcessingStatus>(
        `${this.basePath}/${documentId}/status`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(params: DocumentSearchRequest): Promise<DocumentListResponse> {
    try {
      const response = await axiosInstance.post<DocumentListResponse>(
        `${this.basePath}/search`,
        params
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get download URL for document
   */
  getDownloadUrl(documentId: string): string {
    return `${axiosInstance.defaults.baseURL}${this.basePath}/${documentId}/download`;
  }
}

export const documentsAPI = new DocumentsAPI();