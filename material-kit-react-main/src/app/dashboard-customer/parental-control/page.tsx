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

  // Make sure cars are filtered by customer ID
  React.useEffect(() => {
    setLoading(true);
    
    // Get customer ID
    const customerId = localStorage.getItem('customer-id') || 
                      localStorage.getItem('customer_id') || 
                      localStorage.getItem('userId');
    
    // Create URL with query parameters - add userType and userId
    const url = customerId 
      ? `https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=customer&userId=${customerId}`
      : 'https://driving-behavior-analysis-system.onrender.com/api/cars/';
    
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const mappedCars = Array.isArray(data) ? data.map((item) => ({
          id: item.id || '',
          Model: item.model || item.Model_of_car || '',
          Type: item.type || item.TypeOfCar || '',
          plate_number: item.plateNumber || item.Plate_number || ''
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
      {tabValue === 2 && (
        <AlertsTab 
          selectedCar={selectedCar} 
          carDetails={
            selectedCar !== 'all' 
              ? {
                  model: cars.find(c => c.id === selectedCar)?.Model || 'Unknown',
                  plateNumber: cars.find(c => c.id === selectedCar)?.plate_number || 'Unknown'
                }
              : undefined
          }
        />
      )}
      {tabValue === 3 && <PatternScoreTab showNotification={showNotification} />}
    </Box>
  );
};

export default ParentalControlDashboard;