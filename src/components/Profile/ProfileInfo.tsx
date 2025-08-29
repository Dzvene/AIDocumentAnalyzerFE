import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid
} from '@mui/material';
import {
  Person,
  Email,
  AccessTime,
  VerifiedUser
} from '@mui/icons-material';
import { UserProfile } from '../../api/profileApi';

interface ProfileInfoProps {
  profile: UserProfile;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">
                  {profile.full_name || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    {profile.email}
                  </Typography>
                  {profile.email_verified && (
                    <Chip
                      icon={<VerifiedUser />}
                      label="Verified"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  <Chip
                    label={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    color="primary"
                    size="small"
                  />
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;