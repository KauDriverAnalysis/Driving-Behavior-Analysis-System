'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { TimeFilter } from '@/components/dashboard-customer/overview/time-filter';
import { DrivingMetrics } from '@/components/dashboard-customer/overview/driving-metrics';
import { PerformanceTrend } from '@/components/dashboard-customer/overview/performance-trend';
import { TripHistory } from '@/components/dashboard-customer/overview/trip-history';
import dynamic from 'next/dynamic';

// Import the map component dynamically to prevent SSR issues
const LocationMapComponent = dynamic(
  () => import('@/components/dashboard-admin/tracking/location-map').then(mod => mod.LocationMap),
  { ssr: false }
);

interface Car {
  id: string;
  Model: string;
  plate_number: string;
  model?: string;
  type?: string;
  Type?: string;
}

export default function CustomerOverview(): React.JSX.Element {
  const [timeFrame, setTimeFrame] = useState<'1d' | '7d' | '30d'>('1d');
  const [stats, setStats] = useState({
    totalTrips: 0,
    averageScore: 0,
    milesDriven: 0,
    trend: {
      totalTrips: 0,
      averageScore: 0,
      milesDriven: 0
    }
  });
  const [drivingMetrics, setDrivingMetrics] = useState({
    braking: 0,
    acceleration: 0,
    swerving: 0,
    speeding: 0
  });
  const [performanceTrend, setPerformanceTrend] = useState({
    hours: [],
    days: [],
    weeks: [],
    scores: []
  });
  const [tripHistory, setTripHistory] = useState([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carLocation, setCarLocation] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch cars data when component mounts
  useEffect(() => {
    setLoading(true);
    
    // Get customer ID from localStorage with fallbacks
    const customerId = localStorage.getItem('customer-id') || 
                      localStorage.getItem('customerId') || 
                      localStorage.getItem('customer_id') ||
                      localStorage.getItem('userId');
    
    if (!customerId) {
      setError('No customer ID found. Please log in again.');
      setLoading(false);
      return;
    }
    
    // Fetch cars owned by this customer
    fetch(`http://localhost:8000/api/cars/?userType=customer&userId=${customerId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const mappedCars = Array.isArray(data) ? data.map((item) => ({
          id: item.id || '',
          Model: item.model || item.Model_of_car || '',
          Type: item.type || item.TypeOfCar || '',
          plate_number: item.plateNumber || item.Plate_number || ''
        })) : [];
        
        console.log('Fetched cars for customer:', mappedCars);
        setCars(mappedCars);
        
        if (mappedCars.length > 0) {
          setSelectedCar(mappedCars[0].id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cars:', error);
        setError('Failed to fetch cars. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Fetch data based on selected car and time frame
  useEffect(() => {
    if (!selectedCar) return;
    
    setLoading(true);
    setError(null);
    
    // Fetch car driving data
    fetch(`http://localhost:8000/api/car-driving-data/${selectedCar}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Car driving data:', data);
        
        // Set statistics
        setStats({
          totalTrips: data.summary?.total_records || 0,
          averageScore: data.summary?.avg_score || 100,
          milesDriven: data.summary?.total_distance || 0,
          trend: {
            totalTrips: 0, // No trend data from API yet
            averageScore: 0, // No trend data from API yet
            milesDriven: 0 // No trend data from API yet
          }
        });
        
        // Set metrics
        setDrivingMetrics({
          braking: data.summary?.total_harsh_braking || 0,
          acceleration: data.summary?.total_harsh_acceleration || 0,
          swerving: data.summary?.total_swerving || 0,
          speeding: data.summary?.total_over_speed || 0
        });
        
        // Set performance trend - we'll need to build this from historical data
        // For now, we'll create a simple trend based on the average score
        const score = data.summary?.avg_score || 100;
        let trendLabels;
        if (timeFrame === '1d') {
          trendLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
        } else if (timeFrame === '7d') {
          trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        } else {
          trendLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        }
        
        const scores = trendLabels.map(() => {
          // Simulate variation around the average score
          return Math.max(0, Math.min(100, score + (Math.random() * 10 - 5)));
        });
        
        setPerformanceTrend({
          hours: timeFrame === '1d' ? trendLabels : [],
          days: timeFrame === '7d' ? trendLabels : [],
          weeks: timeFrame === '30d' ? trendLabels : [],
          scores: scores
        });
        
        // Set a simple trip history based on the time frame
        // In a real implementation, this would come from the API
        const trips = [];
        const tripCount = timeFrame === '1d' ? 2 : (timeFrame === '7d' ? 5 : 8);
        
        for (let i = 0; i < tripCount; i++) {
          trips.push({
            start: 'Home',
            destination: 'Office',
            time: trendLabels[i % trendLabels.length],
            score: Math.round(scores[i % scores.length]),
            miles: Math.round(Math.random() * 20 + 5)
          });
        }
        
        setTripHistory(trips);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching car data:', error);
        setError('Failed to fetch car data. Please try again later.');
        setLoading(false);
      });
  }, [selectedCar, timeFrame]);
  
  // Set up real-time location tracking for the selected car
  useEffect(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    if (!selectedCar) return;
    
    // Initial fetch
    fetchCarLocation();
    
    // Set up polling every 5 seconds
    const interval = setInterval(fetchCarLocation, 5000);
    setRefreshInterval(interval);
    
    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedCar]);
  
  const fetchCarLocation = () => {
    if (!selectedCar) return;
    
    fetch(`http://localhost:8000/api/car-location/${selectedCar}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Car location data:', data);
        setCarLocation(data);
      })
      .catch(error => {
        console.error('Error fetching car location:', error);
        // Don't set error state here to avoid interfering with other components
      });
  };

  const handleCarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCar(event.target.value);
  };

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" component="h1">My Driving Dashboard</Typography>
          {loading && <CircularProgress size={24} />}
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          {cars.length > 0 && (
            <TextField
              select
              size="small"
              value={selectedCar}
              onChange={handleCarChange}
              label="Select Car"
              sx={{ minWidth: 200 }}
            >
              {cars.map((car) => (
                <MenuItem key={car.id} value={car.id}>
                  {car.Model} - {car.plate_number}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TimeFilter onFilterChange={setTimeFrame} selectedFilter={timeFrame} />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Car Tracking Map */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Live Car Location</Typography>
              </Box>
              <Divider />
              <Box sx={{ height: '400px', width: '100%', position: 'relative' }}>
                {selectedCar ? (
                  <LocationMapComponent selectedCar={selectedCar} />
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%' 
                  }}>
                    <Typography color="text.secondary">
                      Select a car to view its location
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Key Stats Cards */}
        <Grid item lg={4} sm={6} xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DirectionsCarIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography color="text.secondary" variant="overline">
                  Total Trips
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalTrips}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Trips taken in the last {timeFrame === '1d' ? 'day' : timeFrame === '7d' ? 'week' : 'month'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item lg={4} sm={6} xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography color="text.secondary" variant="overline">
                  Average Score
                </Typography>
              </Box>
              <Typography variant="h4">{stats.averageScore.toFixed(1)}/100</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1, 
                color: stats.trend.averageScore >= 0 ? 'success.main' : 'error.main' 
              }}>
                <Typography variant="body2">
                  Driving performance score
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item lg={4} sm={6} xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography color="text.secondary" variant="overline">
                  Miles Driven
                </Typography>
              </Box>
              <Typography variant="h4">{stats.milesDriven.toFixed(1)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Distance traveled in kilometers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Driving Metrics */}
        <Grid item xs={12} md={6}>
          <DrivingMetrics data={drivingMetrics} />
        </Grid>

        {/* Performance Trend */}
        <Grid item xs={12} md={6}>
          <PerformanceTrend timeFrame={timeFrame} data={performanceTrend} />
        </Grid>

        {/* Trip History */}
        <Grid item xs={12}>
          <TripHistory data={tripHistory} timeFrame={timeFrame} />
        </Grid>
      </Grid>
    </Box>
  );
}