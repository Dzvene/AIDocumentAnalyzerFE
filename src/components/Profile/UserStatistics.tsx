import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  TrendingUp,
  Description,
  Euro,
  AccessTime,
  Refresh
} from '@mui/icons-material';
import { profileApi, UserStatistics as IUserStatistics } from '../../api/profileApi';

interface UserStatisticsProps {
  userId: string;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({ userId }) => {
  const [statistics, setStatistics] = useState<IUserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getStatistics();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await profileApi.refreshStatistics();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh statistics');
    } finally {
      setRefreshing(false);
    }
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

  if (!statistics) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Usage Statistics</Typography>
        <Button
          startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card className="statistics-card">
            <Description color="primary" sx={{ fontSize: 32 }} />
            <Typography className="stat-value">
              {statistics.total_analyses}
            </Typography>
            <Typography className="stat-label">
              Total Analyses
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className="statistics-card">
            <TrendingUp color="success" sx={{ fontSize: 32 }} />
            <Typography className="stat-value">
              {statistics.total_pages}
            </Typography>
            <Typography className="stat-label">
              Pages Processed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className="statistics-card">
            <Euro color="warning" sx={{ fontSize: 32 }} />
            <Typography className="stat-value">
              €{statistics.total_spent.toFixed(2)}
            </Typography>
            <Typography className="stat-label">
              Total Spent
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className="statistics-card">
            <AccessTime color="info" sx={{ fontSize: 32 }} />
            <Typography className="stat-value">
              {statistics.average_processing_time
                ? `${statistics.average_processing_time.toFixed(1)}s`
                : 'N/A'}
            </Typography>
            <Typography className="stat-label">
              Avg. Processing Time
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            Recent Activity
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              This Week
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>{statistics.analyses_this_week}</strong> analyses
              </Typography>
              <Typography variant="body2">
                <strong>€{statistics.spent_this_week.toFixed(2)}</strong> spent
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              This Month
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>{statistics.analyses_this_month}</strong> analyses
              </Typography>
              <Typography variant="body2">
                <strong>€{statistics.spent_this_month.toFixed(2)}</strong> spent
              </Typography>
            </Box>
          </Card>
        </Grid>

        {statistics.favorite_document_types && statistics.favorite_document_types.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Most Analyzed Document Types
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {statistics.favorite_document_types.map((type) => (
                  <Card key={type.type} sx={{ p: 2, minWidth: 120 }}>
                    <Typography variant="h6">{type.count}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.type}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
                <Typography variant="h6">
                  {statistics.total_documents}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Deposited
                </Typography>
                <Typography variant="h6">
                  €{statistics.total_deposited.toFixed(2)}
                </Typography>
              </Grid>
              {statistics.average_document_size && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Average Document Size
                  </Typography>
                  <Typography variant="h6">
                    {(statistics.average_document_size / 1024).toFixed(1)} KB
                  </Typography>
                </Grid>
              )}
              {statistics.last_analysis_at && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Analysis
                  </Typography>
                  <Typography variant="h6">
                    {new Date(statistics.last_analysis_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStatistics;