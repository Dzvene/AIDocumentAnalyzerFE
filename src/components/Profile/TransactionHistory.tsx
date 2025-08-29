import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CardGiftcard,
  Undo
} from '@mui/icons-material';
import { DateTime } from 'luxon';
import { profileApi, Transaction } from '../../api/profileApi';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await profileApi.getTransactions(params);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp color="success" />;
      case 'withdrawal':
      case 'analysis':
        return <TrendingDown color="error" />;
      case 'refund':
        return <Undo color="info" />;
      case 'bonus':
        return <CardGiftcard color="primary" />;
      default:
        return <AccountBalance />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const isPositive = ['deposit', 'refund', 'bonus'].includes(type);
    const sign = isPositive ? '+' : '-';
    return `${sign}€${Math.abs(amount).toFixed(2)}`;
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
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Transaction Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="deposit">Deposits</MenuItem>
              <MenuItem value="withdrawal">Withdrawals</MenuItem>
              <MenuItem value="analysis">Analysis Payments</MenuItem>
              <MenuItem value="refund">Refunds</MenuItem>
              <MenuItem value="bonus">Bonuses</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {transactions.length === 0 ? (
        <Box className="empty-state">
          <AccountBalance className="empty-icon" />
          <Typography variant="h6">No transactions yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Your transaction history will appear here
          </Typography>
        </Box>
      ) : (
        <List>
          {transactions.map((transaction) => (
            <ListItem
              key={transaction.id}
              className="transaction-item"
              sx={{ px: 0 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2 }}>
                  {getTransactionIcon(transaction.type)}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">
                    {transaction.description || transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {DateTime.fromISO(transaction.created_at).toFormat('MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body1"
                    className={`transaction-amount ${
                      ['deposit', 'refund', 'bonus'].includes(transaction.type)
                        ? 'positive'
                        : 'negative'
                    }`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </Typography>
                  <Chip
                    label={transaction.status}
                    size="small"
                    color={getStatusColor(transaction.status) as any}
                  />
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TransactionHistory;