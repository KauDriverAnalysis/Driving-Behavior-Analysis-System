'use client';

import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PatternScoreTab from '@/components/dashboard-admin/pattren-score/tabs/PatternScoreTab';
import AlertsTab from '@/components/dashboard-admin/pattren-score/tabs/AlertsTab';
import DashboardTabs from '@/components/dashboard-admin/pattren-score/DashboardTabs';

const PatternScoreDashboard = () => {
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
        width: '100%',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Pattern Score Dashboard
        </Typography>
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
      {tabValue === 0 && <PatternScoreTab showNotification={showNotification} />}
      {tabValue === 1 && <AlertsTab />}
    </Box>
  );
};

export default PatternScoreDashboard;