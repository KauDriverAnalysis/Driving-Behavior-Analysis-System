"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Stack, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  Fade, 
  Skeleton, 
  Divider,
  Card,
  CardHeader
} from '@mui/material';
import { CarsTable } from '@/components/dashboard-admin/tracking/CarsTableTrack';
import dynamic from 'next/dynamic';
import CarDetailPanel from '@/components/dashboard-admin/tracking/CarDetailPanel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Import the map component dynamically to prevent SSR issues
const LocationMapComponent = dynamic(
  () => import('@/components/dashboard-admin/tracking/location-map').then(mod => mod.LocationMap),
  { ssr: false }
);

export default function Tracking(): React.JSX.Element {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [drivingData, setDrivingData] = useState(null);
  const [fetchingForCarId, setFetchingForCarId] = useState(null);
  const [detailPanelKey, setDetailPanelKey] = useState(0);

  // Fetch cars from API
  useEffect(() => {
    fetch('http://localhost:8000/api/cars/')
      .then(response => response.json())
      .then(data => {
        console.log('Car data received:', data);

        // Add status field based on state property
        const processedCars = data.map((car: any) => {
          const stateValue = car.state?.toLowerCase() || '';

          return {
            ...car,
            status: stateValue === 'online' ? 'Active' : 'Non-Active',
            isActive: stateValue === 'online'
          };
        });

        setCars(processedCars);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching cars:', error);
        setLoading(false);
      });
  }, []);

  // Handle car selection with race condition prevention
  const handleSelectCar = (carId) => {
    // Toggle behavior: if clicking the same car again, close the panel
    if (selectedCar === carId) {
      setSelectedCar(null);
      setDrivingData(null);
      return;
    }

    // Set selected car immediately for UI feedback
    setSelectedCar(carId);
    setDrivingData(null); // Clear previous data while loading

    // Track which car we're currently fetching for
    setFetchingForCarId(carId);

    // Fetch driving data for selected car
    fetch(`http://localhost:8000/api/car-driving-data/${carId}/`)
      .then(response => response.json())
      .then(data => {
        // Only update if this is still the car we want data for
        if (fetchingForCarId === carId) {
          setDrivingData(data);
          setDetailPanelKey(prevKey => prevKey + 1); // Force re-render of panel
        }
      })
      .catch(error => {
        console.error('Error fetching driving data:', error);
        if (fetchingForCarId === carId) {
          setDrivingData(null);
        }
      });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <DirectionsCarIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" fontWeight="600" color="primary.main">Vehicle Tracking Dashboard</Typography>
        </Paper>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ 
              borderRadius: 2, 
              overflow: 'visible', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Fleet Status</Typography>
                  </Box>
                }
                sx={{ backgroundColor: 'background.paper', pb: 1 }}
              />
              <Divider />
              {loading ? (
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" height={300} animation="wave" />
                </Box>
              ) : (
                <CarsTable 
                  cars={cars} 
                  onSelectCar={handleSelectCar} 
                  selectedCar={selectedCar}
                />
              )}
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Card sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Live Tracking Map</Typography>
                  </Box>
                }
                sx={{ backgroundColor: 'background.paper', pb: 1 }}
              />
              <Divider />
              <Box sx={{ height: '600px', width: '100%', position: 'relative' }}>
                <LocationMapComponent selectedCar={selectedCar} />
              </Box>
            </Card>
          </Grid>
          
          {selectedCar && (
            <Grid item xs={12}>
              <Fade in={!!drivingData} timeout={500}>
                <Box>
                  {drivingData ? (
                    <CarDetailPanel 
                      key={`car-${selectedCar}-panel-${detailPanelKey}`} 
                      data={drivingData} 
                    />
                  ) : (
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <Skeleton variant="rectangular" height={150} animation="wave" />
                    </Paper>
                  )}
                </Box>
              </Fade>
            </Grid>
          )}
        </Grid>
      </Stack>
    </Box>
  );
}