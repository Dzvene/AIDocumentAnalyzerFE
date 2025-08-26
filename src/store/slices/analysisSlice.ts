import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  analysisAPI,
  Analysis,
  AnalysisRequest,
  BulkAnalysisRequest,
  AnalysisListRequest,
  AnalysisListResponse,
  AnalysisStatistics,
  AnalysisCostEstimate,
  AnalysisStatus,
  AIProvider,
  RiskLevel,
} from '@api/analysis.api';

interface AnalysisState {
  analyses: Analysis[];
  selectedAnalysis: Analysis | null;
  documentAnalyses: Record<string, Analysis>; // Map document ID to analysis
  statistics: AnalysisStatistics | null;
  costEstimate: AnalysisCostEstimate | null;
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  analyses: [],
  selectedAnalysis: null,
  documentAnalyses: {},
  statistics: null,
  costEstimate: null,
  total: 0,
  page: 1,
  perPage: 20,
  isLoading: false,
  isAnalyzing: false,
  error: null,
};

// Async thunks
export const analyzeDocumentAsync = createAsyncThunk(
  'analysis/analyzeDocument',
  async (request: AnalysisRequest) => {
    const analysis = await analysisAPI.analyzeDocument(request);
    return analysis;
  }
);

export const bulkAnalyzeAsync = createAsyncThunk(
  'analysis/bulkAnalyze',
  async (request: BulkAnalysisRequest) => {
    const analyses = await analysisAPI.bulkAnalyze(request);
    return analyses;
  }
);

export const fetchAnalysesAsync = createAsyncThunk(
  'analysis/fetchAnalyses',
  async (params?: AnalysisListRequest) => {
    const response = await analysisAPI.getAnalyses(params);
    return response;
  }
);

export const fetchAnalysisAsync = createAsyncThunk(
  'analysis/fetchAnalysis',
  async (analysisId: string) => {
    const analysis = await analysisAPI.getAnalysis(analysisId);
    return analysis;
  }
);

export const fetchDocumentAnalysisAsync = createAsyncThunk(
  'analysis/fetchDocumentAnalysis',
  async (documentId: string) => {
    const analysis = await analysisAPI.getDocumentAnalysis(documentId);
    return { documentId, analysis };
  }
);

export const fetchAnalysisStatusAsync = createAsyncThunk(
  'analysis/fetchStatus',
  async (analysisId: string) => {
    const status = await analysisAPI.getAnalysisStatus(analysisId);
    return { analysisId, status };
  }
);

export const fetchCostEstimateAsync = createAsyncThunk(
  'analysis/fetchCostEstimate',
  async ({ documentId, aiProvider }: { documentId: string; aiProvider?: AIProvider }) => {
    const estimate = await analysisAPI.getCostEstimate(documentId, aiProvider);
    return estimate;
  }
);

export const fetchStatisticsAsync = createAsyncThunk(
  'analysis/fetchStatistics',
  async ({ dateFrom, dateTo }: { dateFrom?: string; dateTo?: string }) => {
    const statistics = await analysisAPI.getStatistics(dateFrom, dateTo);
    return statistics;
  }
);

export const downloadReportAsync = createAsyncThunk(
  'analysis/downloadReport',
  async ({ analysisId, format, filename }: { 
    analysisId: string; 
    format: 'pdf' | 'docx';
    filename: string;
  }) => {
    const blob = await analysisAPI.downloadReport(analysisId, format);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return analysisId;
  }
);

export const cancelAnalysisAsync = createAsyncThunk(
  'analysis/cancelAnalysis',
  async (analysisId: string) => {
    await analysisAPI.cancelAnalysis(analysisId);
    return analysisId;
  }
);

export const retryAnalysisAsync = createAsyncThunk(
  'analysis/retryAnalysis',
  async (analysisId: string) => {
    const analysis = await analysisAPI.retryAnalysis(analysisId);
    return analysis;
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAnalysis: (state, action: PayloadAction<Analysis | null>) => {
      state.selectedAnalysis = action.payload;
    },
    updateAnalysisStatus: (state, action: PayloadAction<{ id: string; status: AnalysisStatus }>) => {
      const analysis = state.analyses.find(a => a.id === action.payload.id);
      if (analysis) {
        analysis.status = action.payload.status;
      }
      if (state.selectedAnalysis?.id === action.payload.id) {
        state.selectedAnalysis.status = action.payload.status;
      }
      
      // Update in documentAnalyses map
      const documentAnalysis = Object.values(state.documentAnalyses).find(
        a => a.id === action.payload.id
      );
      if (documentAnalysis) {
        documentAnalysis.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    // Analyze Document
    builder
      .addCase(analyzeDocumentAsync.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeDocumentAsync.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analyses.unshift(action.payload);
        state.documentAnalyses[action.payload.document_id] = action.payload;
        state.total += 1;
      })
      .addCase(analyzeDocumentAsync.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.error.message || 'Failed to start analysis';
      });

    // Bulk Analyze
    builder
      .addCase(bulkAnalyzeAsync.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(bulkAnalyzeAsync.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analyses.unshift(...action.payload);
        action.payload.forEach(analysis => {
          state.documentAnalyses[analysis.document_id] = analysis;
        });
        state.total += action.payload.length;
      })
      .addCase(bulkAnalyzeAsync.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.error.message || 'Failed to start bulk analysis';
      });

    // Fetch Analyses
    builder
      .addCase(fetchAnalysesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalysesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyses = action.payload.analyses;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.perPage = action.payload.per_page;
        
        // Update document analyses map
        action.payload.analyses.forEach(analysis => {
          state.documentAnalyses[analysis.document_id] = analysis;
        });
      })
      .addCase(fetchAnalysesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch analyses';
      });

    // Fetch Single Analysis
    builder
      .addCase(fetchAnalysisAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAnalysis = action.payload;
        
        // Update in list if exists
        const index = state.analyses.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.analyses[index] = action.payload;
        }
        
        // Update in document analyses map
        state.documentAnalyses[action.payload.document_id] = action.payload;
      })
      .addCase(fetchAnalysisAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch analysis';
      });

    // Fetch Document Analysis
    builder
      .addCase(fetchDocumentAnalysisAsync.fulfilled, (state, action) => {
        if (action.payload.analysis) {
          state.documentAnalyses[action.payload.documentId] = action.payload.analysis;
          
          // Update in list if exists
          const index = state.analyses.findIndex(
            a => a.document_id === action.payload.documentId
          );
          if (index !== -1) {
            state.analyses[index] = action.payload.analysis;
          }
        }
      });

    // Fetch Analysis Status
    builder
      .addCase(fetchAnalysisStatusAsync.fulfilled, (state, action) => {
        const analysis = state.analyses.find(a => a.id === action.payload.analysisId);
        if (analysis) {
          analysis.status = action.payload.status;
        }
        if (state.selectedAnalysis?.id === action.payload.analysisId) {
          state.selectedAnalysis.status = action.payload.status;
        }
        
        // Update in documentAnalyses map
        const documentAnalysis = Object.values(state.documentAnalyses).find(
          a => a.id === action.payload.analysisId
        );
        if (documentAnalysis) {
          documentAnalysis.status = action.payload.status;
        }
      });

    // Fetch Cost Estimate
    builder
      .addCase(fetchCostEstimateAsync.fulfilled, (state, action) => {
        state.costEstimate = action.payload;
      });

    // Fetch Statistics
    builder
      .addCase(fetchStatisticsAsync.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });

    // Cancel Analysis
    builder
      .addCase(cancelAnalysisAsync.fulfilled, (state, action) => {
        const analysis = state.analyses.find(a => a.id === action.payload);
        if (analysis) {
          analysis.status = AnalysisStatus.FAILED;
        }
        if (state.selectedAnalysis?.id === action.payload) {
          state.selectedAnalysis.status = AnalysisStatus.FAILED;
        }
      });

    // Retry Analysis
    builder
      .addCase(retryAnalysisAsync.fulfilled, (state, action) => {
        const index = state.analyses.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.analyses[index] = action.payload;
        }
        state.documentAnalyses[action.payload.document_id] = action.payload;
        if (state.selectedAnalysis?.id === action.payload.id) {
          state.selectedAnalysis = action.payload;
        }
      });
  },
});

export const {
  clearError,
  setSelectedAnalysis,
  updateAnalysisStatus,
} = analysisSlice.actions;

export default analysisSlice.reducer;