import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  documentsAPI,
  Document,
  DocumentListResponse,
  DocumentUploadRequest,
  DocumentListRequest,
  DocumentSearchRequest,
  DocumentProcessingStatus,
  BulkUploadResponse,
  DocumentStatus,
  DocumentType,
} from '@api/documents.api';

interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  uploadProgress: number;
  processingStatus: Record<string, DocumentProcessingStatus>;
}

const initialState: DocumentsState = {
  documents: [],
  selectedDocument: null,
  total: 0,
  page: 1,
  perPage: 20,
  isLoading: false,
  isUploading: false,
  error: null,
  uploadProgress: 0,
  processingStatus: {},
};

// Async thunks
export const uploadDocumentAsync = createAsyncThunk(
  'documents/upload',
  async (data: DocumentUploadRequest) => {
    const document = await documentsAPI.uploadDocument(data);
    return document;
  }
);

export const bulkUploadAsync = createAsyncThunk(
  'documents/bulkUpload',
  async ({ files, documentType, language }: { 
    files: File[]; 
    documentType?: DocumentType; 
    language?: string;
  }) => {
    const response = await documentsAPI.bulkUpload(files, documentType, language);
    return response;
  }
);

export const fetchDocumentsAsync = createAsyncThunk(
  'documents/fetchDocuments',
  async (params?: DocumentListRequest) => {
    const response = await documentsAPI.getDocuments(params);
    return response;
  }
);

export const fetchDocumentAsync = createAsyncThunk(
  'documents/fetchDocument',
  async (documentId: string) => {
    const document = await documentsAPI.getDocument(documentId);
    return document;
  }
);

export const deleteDocumentAsync = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId: string) => {
    await documentsAPI.deleteDocument(documentId);
    return documentId;
  }
);

export const searchDocumentsAsync = createAsyncThunk(
  'documents/searchDocuments',
  async (params: DocumentSearchRequest) => {
    const response = await documentsAPI.searchDocuments(params);
    return response;
  }
);

export const fetchDocumentStatusAsync = createAsyncThunk(
  'documents/fetchStatus',
  async (documentId: string) => {
    const status = await documentsAPI.getDocumentStatus(documentId);
    return status;
  }
);

export const extractTextAsync = createAsyncThunk(
  'documents/extractText',
  async ({ documentId, maxPages }: { documentId: string; maxPages?: number }) => {
    const response = await documentsAPI.extractText(documentId, maxPages);
    return { documentId, text: response.text };
  }
);

export const downloadDocumentAsync = createAsyncThunk(
  'documents/download',
  async ({ documentId, filename }: { documentId: string; filename: string }) => {
    const blob = await documentsAPI.downloadDocument(documentId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return documentId;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDocument: (state, action: PayloadAction<Document | null>) => {
      state.selectedDocument = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    updateDocumentStatus: (state, action: PayloadAction<{ id: string; status: DocumentStatus }>) => {
      const document = state.documents.find(d => d.id === action.payload.id);
      if (document) {
        document.status = action.payload.status;
      }
      if (state.selectedDocument?.id === action.payload.id) {
        state.selectedDocument.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    // Upload Document
    builder
      .addCase(uploadDocumentAsync.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocumentAsync.fulfilled, (state, action) => {
        state.isUploading = false;
        state.documents.unshift(action.payload);
        state.total += 1;
        state.uploadProgress = 100;
      })
      .addCase(uploadDocumentAsync.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message || 'Failed to upload document';
        state.uploadProgress = 0;
      });

    // Bulk Upload
    builder
      .addCase(bulkUploadAsync.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(bulkUploadAsync.fulfilled, (state, action) => {
        state.isUploading = false;
        state.documents.unshift(...action.payload.uploaded);
        state.total += action.payload.total_uploaded;
        state.uploadProgress = 100;
      })
      .addCase(bulkUploadAsync.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message || 'Failed to upload documents';
        state.uploadProgress = 0;
      });

    // Fetch Documents
    builder
      .addCase(fetchDocumentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.documents;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.perPage = action.payload.per_page;
      })
      .addCase(fetchDocumentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      });

    // Fetch Single Document
    builder
      .addCase(fetchDocumentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDocument = action.payload;
        
        // Update in list if exists
        const index = state.documents.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
      })
      .addCase(fetchDocumentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch document';
      });

    // Delete Document
    builder
      .addCase(deleteDocumentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocumentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(d => d.id !== action.payload);
        state.total -= 1;
        if (state.selectedDocument?.id === action.payload) {
          state.selectedDocument = null;
        }
      })
      .addCase(deleteDocumentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete document';
      });

    // Search Documents
    builder
      .addCase(searchDocumentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDocumentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.documents;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.perPage = action.payload.per_page;
      })
      .addCase(searchDocumentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search documents';
      });

    // Fetch Document Status
    builder
      .addCase(fetchDocumentStatusAsync.fulfilled, (state, action) => {
        state.processingStatus[action.payload.document_id] = action.payload;
        
        // Update document status in list
        const document = state.documents.find(d => d.id === action.payload.document_id);
        if (document) {
          document.status = action.payload.status;
        }
        if (state.selectedDocument?.id === action.payload.document_id) {
          state.selectedDocument.status = action.payload.status;
        }
      });

    // Extract Text
    builder
      .addCase(extractTextAsync.fulfilled, (state, action) => {
        const document = state.documents.find(d => d.id === action.payload.documentId);
        if (document) {
          document.text_content = action.payload.text;
        }
        if (state.selectedDocument?.id === action.payload.documentId) {
          state.selectedDocument.text_content = action.payload.text;
        }
      });
  },
});

export const {
  clearError,
  setSelectedDocument,
  setUploadProgress,
  updateDocumentStatus,
} = documentsSlice.actions;

export default documentsSlice.reducer;