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

  // Fetch all cars data initially
  useEffect(() => {
    fetchCars();
    
    // Set up regular polling for car data
    const carsInterval = setInterval(fetchCars, 5000);
    
    return () => clearInterval(carsInterval);
  }, []);
  
  // Fetch detailed data for selected car and poll
  useEffect(() => {
    if (!selectedCar) return;
    
    fetchCarDetails(selectedCar);
    
    // Poll for updated details every 5 seconds
    const detailsInterval = setInterval(() => {
      fetchCarDetails(selectedCar);
    }, 5000);
    
    return () => clearInterval(detailsInterval);
  }, [selectedCar]);
  
  // Function to fetch all cars
  const fetchCars = () => {
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
        
        // After getting basic car data, fetch latest metrics for each car
        fetchAllCarsLatestMetrics(processedCars);
      })
      .catch(error => {
        console.error('Error fetching cars:', error);
        setLoading(false);
      });
  };

  // Function to fetch latest metrics (speed and score) for all cars
  const fetchAllCarsLatestMetrics = (carsList) => {
    // Create array of promises for each car's data
    const metricPromises = carsList.map(car => 
      fetch(`http://localhost:8000/api/car-driving-data/${car.id}/`)
        .then(response => response.json())
        .catch(error => {
          console.error(`Error fetching metrics for car ${car.id}:`, error);
          return null;
        })
    );

    // When all promises resolve, update cars with the metrics
    Promise.all(metricPromises)
      .then(results => {
        // Filter out any failed requests
        const validResults = results.filter(result => result !== null);
        
        // Update each car with its metrics
        const updatedCars = carsList.map(car => {
          // Find matching result for this car
          const carData = validResults.find(result => 
            result && (result.car_id === car.id || result.car_id === car.id.toString())
          );
          
          if (carData && carData.current) {
            return {
              ...car,
              speed: carData.current.speed,
              score: carData.current.score
            };
          }
          return car;
        });
        
        // Update state with enhanced car data
        setCars(updatedCars);
      })
      .catch(error => {
        console.error('Error updating car metrics:', error);
      });
  };
  
 // Function to fetch details for a specific car
// Function to fetch details for a specific car
const fetchCarDetails = (carId) => {
  setFetchingForCarId(carId);

  // Fetch driving data for selected car
  fetch(`http://localhost:8000/api/car-driving-data/${carId}/`)
    .then(response => response.json())
    .then(data => {
      // Only update if this is still the car we want data for
      if (fetchingForCarId === carId) {
        console.log('Car driving data received:', data); // Debug the structure
        
        // Check if data is in the correct format
        if (data && data.current && data.summary) {
          // Combine current data with summary data
          setDrivingData({
            car_id: data.car_id,
            model: data.model,
            plate_number: data.plate_number,
            device_id: data.device_id,
            state: data.state,
            
            // Latest values for current speed
            current_speed: data.current.speed,
            
            // Aggregated values
            distance: data.summary.total_distance,
            score: data.summary.avg_score,
            
            // Sum of all events from historical data
            harsh_braking_events: data.summary.total_harsh_braking,
            harsh_acceleration_events: data.summary.total_harsh_acceleration,
            swerving_events: data.summary.total_swerving,
            potential_swerving_events: data.summary.total_potential_swerving,
            over_speed_events: data.summary.total_over_speed,
            
            // Additional metadata
            total_records: data.summary.total_records
          });
        } else {
          // Use data as is
          setDrivingData(data);
        }
        
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

  // Handle car selection
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
    
    // Fetch data for the selected car
    fetchCarDetails(carId);
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

