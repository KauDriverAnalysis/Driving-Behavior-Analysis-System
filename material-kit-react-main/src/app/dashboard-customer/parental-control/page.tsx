'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardTabs from '@/components/dashboard-customer/parental-control/DashboardTabs';
import OverviewTab from '@/components/dashboard-customer/parental-control/tabs/OverviewTab';
import AlertsTab from '@/components/dashboard-customer/parental-control/tabs/AlertsTab';
import PatternScoreTab from '@/components/dashboard-customer/parental-control/tabs/PatternScoreTab';
import { TextField, MenuItem, Stack, CircularProgress } from '@mui/material';

// Define interface for notification state
interface Notification {
  message: string;
  type: 'success' | 'error';
}

// Define interface for car objects
interface Car {
  id: string;
  Model_of_car: string;
  TypeOfCar: string;
  Plate_number: string;
}

const ParentalControlDashboard = (): React.JSX.Element => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Show notification function with proper types
  const showNotification = (message: string, type: 'success' | 'error' = 'success'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const adaptShowNotification = (message: string, type?: string): void => {
    // Only pass valid types to the original function
    if (type === 'success' || type === 'error') {
      showNotification(message, type);
    } else {
      showNotification(message, 'success'); // Default to success for any other string
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  // Add useEffect for fetching cars
  React.useEffect(() => {
    setLoading(true);
    
    // Get customer ID from localStorage - similar to how you get company ID elsewhere
    const customer_id = localStorage.getItem('customer_id') || 
                     localStorage.getItem('customerId') || 
                     localStorage.getItem('userId');
    
    if (!customer_id) {
      console.error('No customer ID found in localStorage');
      setLoading(false);
      return;
    }
    
    // Add customer ID as filter parameter
    const apiUrl = `https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=customer&userId=${customer_id}`;
    
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log('Cars data received:', data);
        
        const mappedCars = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id || '',
          Model_of_car: item.Model_of_car || item.Model_of_car || '',
          TypeOfCar: item.TypeOfCar || item.TypeOfCar || '',
          Plate_number: item.Plate_number || ''
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

  // Add car selection handler with proper types
  const handleCarChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
                  {car.Model_of_car} - {car.Plate_number}
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

      {/* Tab Content - Updated tab indices */}
      {tabValue === 0 && <OverviewTab selectedCar={selectedCar} />}
      {tabValue === 1 && <AlertsTab selectedCar={selectedCar} />}
      {tabValue === 2 && <PatternScoreTab showNotification={adaptShowNotification} selectedCar={selectedCar} />}
    </Box>
  );
};

export default ParentalControlDashboard;