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
import { TextField, MenuItem, Stack, CircularProgress } from '@mui/material';

interface Car {
  id: string;
  Model: string;
  Type: string;
  plate_number: string;
}

const ParentalControlDashboard = () => {
  const [notification, setNotification] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState('all');
  const [loading, setLoading] = React.useState(true);

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Add useEffect for fetching cars
  React.useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/cars/')
      .then((response) => response.json())
      .then((data) => {
        const mappedCars = Array.isArray(data) ? data.map((item) => ({
          id: item.id || '',
          Model: item.Model || item.model || '',
          Type: item.Type || item.type || '',
          plate_number: item.plate_number || ''
        })) : [];
        
        setCars(mappedCars);
        if (mappedCars.length > 0) {
          setSelectedCar(mappedCars[0].id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cars:', error);
        setLoading(false);
      });
  }, []);

  // Add car selection handler
  const handleCarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCar(event.target.value);
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
        <Stack direction="row" spacing={2} alignItems="center" flex={1}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Parental Control Dashboard
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <TextField
              select
              size="small"
              value={selectedCar}
              onChange={handleCarChange}
              label="Select Car"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Cars</MenuItem>
              {cars.map((car) => (
                <MenuItem key={car.id} value={car.id}>
                  {car.Model} - {car.plate_number}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
        
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