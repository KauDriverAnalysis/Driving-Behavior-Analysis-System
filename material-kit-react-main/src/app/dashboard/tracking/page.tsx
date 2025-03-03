"use client";

import * as React from 'react';
import { Stack, Grid, Typography, Box } from '@mui/material';
import { CarsTable } from '@/components/dashboard/tracking/CarsTableTrack';
import dynamic from 'next/dynamic';

// Import the map component dynamically to prevent SSR issues
const LocationMapComponent = dynamic(
  () => import('@/components/maps/location-map').then(mod => mod.LocationMap),
  { ssr: false }
);

const cars = [
  { id: 'CAR-001', name: 'Car 1', status: 'Active' },
  { id: 'CAR-002', name: 'Car 2', status: 'Active' },
  { id: 'CAR-003', name: 'Car 3', status: 'Non-Active' },
  { id: 'CAR-004', name: 'Car 4', status: 'Non-Active' },
  { id: 'CAR-005', name: 'Car 5', status: 'Active' },
  { id: 'CAR-006', name: 'Car 6', status: 'Active' },
  { id: 'CAR-007', name: 'Car 7', status: 'Non-Active' },
  { id: 'CAR-008', name: 'Car 8', status: 'Non-Active' },  
  { id: 'CAR-009', name: 'Car 9', status: 'Active' },
  { id: 'CAR-010', name: 'Car 10', status: 'Active' },
  { id: 'CAR-011', name: 'Car 11', status: 'Non-Active' },
  { id: 'CAR-012', name: 'Car 12', status: 'Non-Active' },
  { id: 'CAR-013', name: 'Car 13', status: 'Active' },
  { id: 'CAR-014', name: 'Car 14', status: 'Active' },
  { id: 'CAR-015', name: 'Car 15', status: 'Non-Active' },
  { id: 'CAR-016', name: 'Car 16', status: 'Non-Active' },
];

export default function Tracking(): React.JSX.Element {
  // Sort cars so that active cars come first
  const sortedCars = [...cars].sort((a, b) => {
    if (a.status === 'Active' && b.status !== 'Active') {
      return -1;
    }
    if (a.status !== 'Active' && b.status === 'Active') {
      return 1;
    }
    return 0;
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Tracking</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CarsTable cars={sortedCars} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Live Tracking Map</Typography>
          <Box sx={{ height: '650px', width: '100%' }}>
            <LocationMapComponent />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}