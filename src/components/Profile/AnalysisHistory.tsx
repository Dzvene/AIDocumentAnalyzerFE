import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid
} from '@mui/material';
import {
  Download,
  Delete,
  Visibility,
  Description,
  Euro
} from '@mui/icons-material';
import { DateTime } from 'luxon';
import { profileApi, AnalysisHistoryItem } from '../../api/profileApi';

const AnalysisHistory: React.FC = () => {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getAnalysisHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (item: AnalysisHistoryItem) => {
    try {
      const detailed = await profileApi.getAnalysisDetail(item.id);
      setSelectedItem(detailed);
      setDetailOpen(true);
    } catch (err) {
      console.error('Failed to load details:', err);
    }
  };

  const handleDownloadPDF = async (historyId: number, documentName: string) => {
    try {
      const blob = await profileApi.exportAnalysisToPDF(historyId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${documentName.replace(/\.[^/.]+$/, '')}_${historyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await profileApi.deleteAnalysisHistory(itemToDelete);
      setHistory(history.filter(item => item.id !== itemToDelete));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {history.length === 0 ? (
        <Box className="empty-state">
          <Description className="empty-icon" />
          <Typography variant="h6">No analysis history</Typography>
          <Typography variant="body2" color="text.secondary">
            Your document analyses will appear here
          </Typography>
        </Box>
      ) : (
        <Box>
          {history.map((item) => (
            <Card key={item.id} className="analysis-history-item">
              <Typography variant="h6" className="document-name">
                {item.document_name}
              </Typography>
              
              <Box className="document-meta">
                {item.document_type && (
                  <Chip 
                    label={item.document_type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {item.page_count && (
                  <Typography variant="caption">
                    {item.page_count} pages
                  </Typography>
                )}
                <Typography variant="caption">
                  €{item.cost.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {DateTime.fromISO(item.created_at).toFormat('MMM dd, yyyy')}
                </Typography>
              </Box>

              {item.summary && (
                <Typography variant="body2" className="document-summary">
                  {item.summary.length > 200 
                    ? item.summary.substring(0, 200) + '...'
                    : item.summary}
                </Typography>
              )}

              <Box className="document-actions">
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleViewDetail(item)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleDownloadPDF(item.id, item.document_name)}
                >
                  Download PDF
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => confirmDelete(item.id)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedItem?.document_name}</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Document Type
                  </Typography>
                  <Typography>{selectedItem.document_type || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Analysis Date
                  </Typography>
                  <Typography>
                    {DateTime.fromISO(selectedItem.created_at).toFormat('MMMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Pages Analyzed
                  </Typography>
                  <Typography>{selectedItem.page_count || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Cost
                  </Typography>
                  <Typography>€{selectedItem.cost.toFixed(2)}</Typography>
                </Grid>
              </Grid>

              {selectedItem.summary && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Typography variant="body2">{selectedItem.summary}</Typography>
                </Box>
              )}

              {selectedItem.risks && selectedItem.risks.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Identified Risks</Typography>
                  {selectedItem.risks.map((risk, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        • {typeof risk === 'string' ? risk : risk.description || risk.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {selectedItem.recommendations && selectedItem.recommendations.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Recommendations</Typography>
                  {selectedItem.recommendations.map((rec, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        • {typeof rec === 'string' ? rec : rec.description || rec.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => selectedItem && handleDownloadPDF(selectedItem.id, selectedItem.document_name)}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Analysis History</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this analysis from your history?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalysisHistory;