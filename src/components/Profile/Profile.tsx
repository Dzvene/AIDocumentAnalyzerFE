import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AccountBalanceWallet,
  History,
  Analytics,
  Settings,
  Refresh,
  Download
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { profileApi } from '../../api/profileApi';
import ProfileInfo from './ProfileInfo';
import BalanceSection from './BalanceSection';
import TransactionHistory from './TransactionHistory';
import AnalysisHistory from './AnalysisHistory';
import UserStatistics from './UserStatistics';
import ProfileSettings from './ProfileSettings';
import './Profile.scss';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getProfile();
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="profile-container">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
            >
              {profileData?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {profileData?.full_name || profileData?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profileData?.email} • {profileData?.role}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
            >
              <Refresh className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AccountBalanceWallet />} label="Balance" />
          <Tab icon={<History />} label="Transactions" />
          <Tab icon={<History />} label="Analysis History" />
          <Tab icon={<Analytics />} label="Statistics" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <BalanceSection
            balance={profileData?.account_balance}
            currency={profileData?.currency}
            onBalanceUpdate={fetchProfileData}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TransactionHistory />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AnalysisHistory />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <UserStatistics userId={profileData?.id} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <ProfileSettings
            profile={profileData}
            onUpdate={fetchProfileData}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Profile;