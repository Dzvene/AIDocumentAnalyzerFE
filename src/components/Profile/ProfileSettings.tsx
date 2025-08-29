import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { profileApi, UserProfile } from '../../api/profileApi';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    language: profile.language || 'en',
    notifications_enabled: profile.notifications_enabled ?? true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await profileApi.updateProfile(formData);
      setSuccess(true);
      onUpdate();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profile.username}
                  disabled
                  helperText="Username cannot be changed"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ru">Русский</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="it">Italiano</MenuItem>
                    <MenuItem value="pl">Polski</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notifications_enabled}
                  onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
                />
              }
              label="Enable email notifications"
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Receive notifications about your analyses, balance changes, and important updates
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Account Type
                </Typography>
                <Typography variant="body1">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Email Verified
                </Typography>
                <Typography variant="body1">
                  {profile.email_verified ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {profile.last_login 
                    ? new Date(profile.last_login).toLocaleString()
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usage Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Documents Analyzed
                </Typography>
                <Typography variant="h6">
                  {profile.documents_count}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Analyses
                </Typography>
                <Typography variant="h6">
                  {profile.analyses_count}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Spent
                </Typography>
                <Typography variant="h6">
                  €{profile.total_spent.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileSettings;