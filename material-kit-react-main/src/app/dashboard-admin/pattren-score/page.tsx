'use client';

import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PatternScoreTab from '@/components/dashboard-admin/pattren-score/tabs/PatternScoreTab';
import AlertsTab from '@/components/dashboard-admin/pattren-score/tabs/AlertsTab';
import DashboardTabs from '@/components/dashboard-admin/pattren-score/DashboardTabs';

// Define interface for notification state
interface Notification {
  message: string;
  type: 'success' | 'error';
}

interface PatternScoreTabProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const PatternScoreDashboard = (): React.JSX.Element => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  // Show notification function with proper types
  const showNotification = (message: string, type: 'success' | 'error' = 'success'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add this function
  const adaptShowNotification = (message: string, type?: string): void => {
    // Only pass valid types to the original function
    if (type === 'success' || type === 'error') {
      showNotification(message, type);
    } else {
      // Default to success for any other string
      showNotification(message, 'success');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
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
      {tabValue === 0 && <PatternScoreTab showNotification={adaptShowNotification} />}
      {tabValue === 1 && <AlertsTab />}
    </Box>
  );
};

export default PatternScoreDashboard;