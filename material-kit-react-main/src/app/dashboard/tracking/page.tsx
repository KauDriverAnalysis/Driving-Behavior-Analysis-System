"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Stack, Grid, Typography, Box } from '@mui/material';
import { CarsTable } from '@/components/dashboard/tracking/CarsTableTrack';
import dynamic from 'next/dynamic';
import CarDetailPanel from '@/components/dashboard/tracking/CarDetailPanel';

// Import the map component dynamically to prevent SSR issues
const LocationMapComponent = dynamic(
  () => import('@/components/maps/location-map').then(mod => mod.LocationMap),
  { ssr: false }
);

export default function Tracking(): React.JSX.Element {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [drivingData, setDrivingData] = useState(null);

  // Fetch cars from API
  useEffect(() => {
    fetch('http://localhost:8000/api/cars/')
      .then(response => response.json())
      .then(data => {
        // Add status field based on State_of_car
        const processedCars = data.map(car => ({
          ...car,
          status: car.state === 'Active' ? 'Active' : 'Non-Active'
        }));
        setCars(processedCars);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching cars:', error);
        setLoading(false);
      });
  }, []);

  // Handle car selection
  const handleSelectCar = (carId) => {
    setSelectedCar(carId);
    
    // Fetch driving data for selected car
    fetch(`http://localhost:8000/api/car-driving-data/${carId}/`)
      .then(response => response.json())
      .then(data => {
        setDrivingData(data);
      })
      .catch(error => {
        console.error('Error fetching driving data:', error);
      });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Tracking</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Typography>Loading cars...</Typography>
          ) : (
            <CarsTable 
              cars={cars} 
              onSelectCar={handleSelectCar} 
              selectedCar={selectedCar}
            />
          )}
          {selectedCar && drivingData && (
            <CarDetailPanel data={drivingData} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Live Tracking Map</Typography>
          <Box sx={{ height: '650px', width: '100%' }}>
            <LocationMapComponent selectedCar={selectedCar} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}