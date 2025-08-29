import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add,
  AccountBalanceWallet,
  TrendingUp,
  Euro
} from '@mui/icons-material';
import { profileApi } from '../../api/profileApi';

interface BalanceSectionProps {
  balance?: number;
  currency?: string;
  onBalanceUpdate: () => void;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({
  balance = 0,
  currency = 'EUR',
  onBalanceUpdate
}) => {
  const [topupOpen, setTopupOpen] = useState(false);
  const [amount, setAmount] = useState<string>('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedAmounts = [5, 10, 20, 50, 100];
  
  const formatCurrency = (amount: number, currencyCode: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleTopup = async () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 5) {
      setError(`Minimum top-up amount is ${formatCurrency(5, currency)}`);
      return;
    }

    if (numAmount > 10000) {
      setError(`Maximum top-up amount is ${formatCurrency(10000, currency)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await profileApi.topUpBalance(numAmount);
      setTopupOpen(false);
      onBalanceUpdate();
      setAmount('10');
    } catch (err: any) {
      setError(err.message || 'Failed to top up balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Card className="balance-card" elevation={0}>
          <AccountBalanceWallet sx={{ fontSize: 40, mb: 2 }} />
          <Typography className="balance-label" variant="body2">
            Current Balance
          </Typography>
          <Typography className="balance-amount">
            {formatCurrency(balance, currency)}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              mt: 2,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            onClick={() => setTopupOpen(true)}
          >
            Top Up Balance
          </Button>
        </Card>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card className="statistics-card">
              <TrendingUp color="primary" />
              <Typography className="stat-value">
                {formatCurrency((balance || 0) * 0.05, currency)}
              </Typography>
              <Typography className="stat-label">
                Estimated Pages
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Based on avg. {formatCurrency(0.05, currency)}/page
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="statistics-card">
              <Euro color="primary" />
              <Typography className="stat-value">
                {Math.floor((balance || 0) / 2)}
              </Typography>
              <Typography className="stat-label">
                Documents Available
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Based on avg. {formatCurrency(2, currency)}/document
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="statistics-card">
              <AccountBalanceWallet color="primary" />
              <Typography className="stat-value">
                {currency || 'EUR'}
              </Typography>
              <Typography className="stat-label">
                Currency
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All prices in {currency || 'EUR'}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>How pricing works:</strong> You pay per page analyzed.
            Standard rate is {formatCurrency(0.05, currency)} per page. Complex documents may have
            different rates.
          </Typography>
        </Alert>
      </Box>

      <Dialog
        open={topupOpen}
        onClose={() => setTopupOpen(false)}
        maxWidth="sm"
        fullWidth
        className="topup-dialog"
      >
        <DialogTitle>Top Up Balance</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add funds to your account balance. Minimum amount is {formatCurrency(5, currency)}.
          </Typography>

          <Box className="amount-buttons">
            {predefinedAmounts.map((presetAmount) => (
              <Chip
                key={presetAmount}
                label={`€${presetAmount}`}
                onClick={() => setAmount(presetAmount.toString())}
                variant={amount === presetAmount.toString() ? 'filled' : 'outlined'}
                color="primary"
                clickable
              />
            ))}
          </Box>

          <TextField
            fullWidth
            label="Amount (EUR)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: '€',
              inputProps: { min: 5, max: 10000, step: 0.01 }
            }}
            helperText={`Enter amount between ${formatCurrency(5, currency)} and ${formatCurrency(10000, currency)}`}
          />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="caption">
              This is a demo. In production, you would be redirected to a
              secure payment page.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopupOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleTopup}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          >
            {loading ? 'Processing...' : `Add €${parseFloat(amount || '0').toFixed(2)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BalanceSection;