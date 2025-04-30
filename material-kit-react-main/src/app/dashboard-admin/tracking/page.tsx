"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
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

// Define the interface for car metrics
export interface CarMetrics {
  [carId: string]: {
    speed: number | null;
    score: number | null;
  };
}

// Define an interface for your Car type (rename to avoid conflicts)
export interface Car {
  id: string | number;
  model?: string;
  plate_number?: string;
  status?: string;
  isActive?: boolean;
  speed?: number | null;
  score?: number | null;
  // Add all required properties
}

export default function Tracking(): React.JSX.Element {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [drivingData, setDrivingData] = useState<any | null>(null);
  const [fetchingForCarId, setFetchingForCarId] = useState<string | null>(null);
  const [detailPanelKey, setDetailPanelKey] = useState(0);
  
  // Use proper type for the ref
  const lastMetricsRef = useRef<CarMetrics>({});

  // Fetch all cars data initially
  useEffect(() => {
    fetchCars();
    
    // Set up regular polling for car data (basic data only)
    const carsInterval = setInterval(fetchCars, 5000);
    
    // Set up separate less frequent interval for metrics
    const metricsInterval = setInterval(() => {
      if (cars.length > 0) {
        fetchAllCarsLatestMetrics(cars);
      }
    }, 15000); // Update metrics every 15 seconds
    
    return () => {
      clearInterval(carsInterval);
      clearInterval(metricsInterval);
    };
  }, [cars.length]);
  
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
  
  // Update the fetchCars function to never fetch all cars
  const fetchCars = () => {
    // Get the company ID from local storage
    const company_id = localStorage.getItem('company_id') || 
                     localStorage.getItem('companyId') || 
                     localStorage.getItem('employee-company-id');
                     
    // Add this debugging line right after getting the company_id
    
    // Only fetch if we have a company ID
    if (!company_id) {
      console.error('No company ID found. Cannot fetch cars.');
      setLoading(false);
      setCars([]);
      return;
    }
    
    // Only use the company-filtered URL
    const apiUrl = `https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=company&userId=${company_id}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Car data received:', data);

        // Add status field based on state property
        const processedCars = data.map((car: any) => {
          const stateValue = car.state?.toLowerCase() || '';
          const carId = car.id.toString();
          
          // Preserve existing metrics if available
          const existingMetrics = lastMetricsRef.current[carId] || {};
          
          return {
            ...car,
            status: stateValue === 'online' ? 'Active' : 'Non-Active',
            isActive: stateValue === 'online',
            speed: (existingMetrics as any).speed !== undefined ? (existingMetrics as any).speed : null,
            score: (existingMetrics as any).score !== undefined ? (existingMetrics as any).score : null
          };
        });

        setCars(processedCars);
        setLoading(false);
        
        // Only fetch metrics initially if we don't have any
        if (Object.keys(lastMetricsRef.current).length === 0) {
          fetchAllCarsLatestMetrics(processedCars);
        }
      })
      .catch(error => {
        console.error('Error fetching cars:', error);
        setLoading(false);
      });
  };

  const fetchAllCarsLatestMetrics = (carsList: Car[]) => {
    console.log("Fetching metrics for all cars...");
    
    // Create array of promises for each car's data
    const metricPromises = carsList.map(car => 
      fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${car.id}/`)
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
        
        // Update cars with preserved values
        const updatedCars = carsList.map(car => {
          // Find matching result for this car
          const carData = validResults.find(result => 
            result && (result.car_id === car.id || result.car_id === car.id.toString())
          );
          
          const carId = car.id.toString();
          
          if (carData && carData.current) {
            // Update the cached metrics for this car
            lastMetricsRef.current[carId] = {
              speed: carData.current.speed,
              score: carData.current.score
            };
            
            return {
              ...car,
              speed: carData.current.speed,
              score: carData.current.score
            };
          }
          
          // Keep previous values if no new data
          return car;
        });
        
        // Update state with enhanced car data
        setCars(updatedCars);
      })
      .catch(error => {
        console.error('Error updating car metrics:', error);
      });
  };
  
  const fetchCarDetails = (carId: string | number) => {
    setFetchingForCarId(carId as string);
    
    // Keep the previous driving data while loading
    const previousData = drivingData;

    // Fetch driving data for selected car
    fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${carId}/`)
      .then(response => response.json())
      .then(data => {
        // Only update if this is still the car we want data for
        if (fetchingForCarId === carId) {
          console.log('Car driving data received:', data);
          
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
            
            // Increment panel key to force re-render
            setDetailPanelKey(prevKey => prevKey + 1);
          } else {
            // Use data as is
            setDrivingData(data);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching driving data:', error);
        // On error, don't clear existing data
      });
  };

  // Handle car selection
  const handleSelectCar = (carId: string | number) => {
    // Toggle behavior: if clicking the same car again, close the panel
    if (selectedCar === carId) {
      setSelectedCar(null);
      return;
    }

    // Set selected car immediately for UI feedback
    setSelectedCar(carId as string);
    
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
                  cars={cars as any} // Type assertion to bypass type checking
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

