'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardTabs from '@/components/dashboard-customer/parental-control/DashboardTabs';
import OverviewTab from '@/components/dashboard-customer/parental-control/tabs/OverviewTab';
import EmergencyContactsTab from '@/components/dashboard-customer/parental-control/tabs/EmergencyContactsTab';
import AlertsTab from '@/components/dashboard-customer/parental-control/tabs/AlertsTab';
import PatternScoreTab from '@/components/dashboard-customer/parental-control/tabs/PatternScoreTab';

const ParentalControlDashboard = () => {
  const [notification, setNotification] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      p: { xs: 2, sm: 3 },
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        width: '100%'
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Parental Control Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.light' }
            }}
            size="small"
          >
            <NotificationsIcon />
          </IconButton>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              borderRadius: '20px',
              px: 2, 
              py: 0.5,
              fontWeight: 'medium',
              fontSize: '0.875rem'
            }}
          >
            Active
          </Box>
        </Box>
      </Box>

      {/* Notification */}
      {notification && (
        <Alert 
          severity={notification.type === 'error' ? 'error' : 'success'} 
          sx={{ mb: 2 }}
          icon={notification.type === 'error' ? <WarningIcon /> : <CheckCircleIcon />}
        >
          {notification.message}
        </Alert>
      )}

      {/* Tabs */}
      <DashboardTabs tabValue={tabValue} handleTabChange={handleTabChange} />

      {/* Tab Content */}
      {tabValue === 0 && <OverviewTab />}
      {tabValue === 1 && <EmergencyContactsTab showNotification={showNotification} />}
      {tabValue === 2 && <AlertsTab />}
      {tabValue === 3 && <PatternScoreTab showNotification={showNotification} />}
    </Box>
  );
};

export default ParentalControlDashboard;