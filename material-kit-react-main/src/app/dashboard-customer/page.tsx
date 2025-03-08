// CustomerOverview.tsx
'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { TimeFilter } from '@/components/dashboard-customer/overview/time-filter';
import { DrivingMetrics } from '@/components/dashboard-customer/overview/driving-metrics';
import { PerformanceTrend } from '@/components/dashboard-customer/overview/performance-trend';
import { TripHistory } from '@/components/dashboard-customer/overview/trip-history';
import { CarLocation } from '@/components/dashboard-customer/overview/car-location';

// Enhanced fake data for different time frames
const fakeStatsData = {
  '1d': {
    totalTrips: 3,
    averageScore: 87,
    milesDriven: 42,
    trend: {
      averageScore: +2,
      milesDriven: +5
    }
  },
  '7d': {
    totalTrips: 12,
    averageScore: 83,
    milesDriven: 156,
    trend: {
      averageScore: -1,
      milesDriven: +23
    }
  },
  '30d': {
    totalTrips: 45,
    averageScore: 85,
    milesDriven: 487,
    trend: {
      averageScore: +3,
      milesDriven: +65
    }
  }
};

const fakeDrivingMetricsData = {
  '1d': {
    braking: 82,
    acceleration: 75,
    swerving: 90,
    speeding: 78
  },
  '7d': {
    braking: 78,
    acceleration: 72,
    swerving: 85,
    speeding: 71
  },
  '30d': {
    braking: 80,
    acceleration: 74,
    swerving: 87,
    speeding: 76
  }
};

const fakePerformanceTrendData = {
  '1d': {
    hours: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    scores: [85, 88, 82, 86, 90, 87]
  },
  '7d': {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    scores: [84, 86, 82, 89, 85, 83, 87]
  },
  '30d': {
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    scores: [85, 82, 86, 88]
  }
};

const fakeTripHistoryData = {
  '1d': [
    { start: 'Home', destination: 'Office', time: '08:15 AM', score: 87, miles: 12 },
    { start: 'Office', destination: 'Lunch', time: '12:30 PM', score: 90, miles: 5 },
    { start: 'Lunch', destination: 'Office', time: '01:45 PM', score: 85, miles: 5 },
    { start: 'Office', destination: 'Home', time: '05:30 PM', score: 86, miles: 12 }
  ],
  '7d': [
    { start: 'Home', destination: 'Office', time: 'Mon 08:15 AM', score: 87, miles: 12 },
    { start: 'Office', destination: 'Home', time: 'Mon 05:30 PM', score: 86, miles: 12 },
    { start: 'Home', destination: 'Gym', time: 'Tue 07:00 AM', score: 89, miles: 8 },
    { start: 'Gym', destination: 'Office', time: 'Tue 09:00 AM', score: 84, miles: 10 },
    { start: 'Office', destination: 'Home', time: 'Tue 06:00 PM', score: 82, miles: 12 }
  ],
  '30d': [
    { start: 'Home', destination: 'Office', time: 'Week 1', score: 87, miles: 60 },
    { start: 'Office', destination: 'Home', time: 'Week 1', score: 86, miles: 60 },
    { start: 'Home', destination: 'Grocery', time: 'Week 2', score: 89, miles: 15 },
    { start: 'Home', destination: 'Office', time: 'Week 2', score: 84, miles: 60 },
    { start: 'Office', destination: 'Home', time: 'Week 2', score: 82, miles: 60 }
  ]
};

const fakeCarLocationData = {
  latitude: 37.7749,
  longitude: -122.4194,
  lastUpdated: '5 minutes ago',
  address: '123 Main Street, San Francisco, CA',
  status: 'Parked'
};

export default function CustomerOverview(): React.JSX.Element {
  const [timeFrame, setTimeFrame] = React.useState<'1d' | '7d' | '30d'>('1d');
  const [stats, setStats] = React.useState(fakeStatsData['1d']);
  const [drivingMetrics, setDrivingMetrics] = React.useState(fakeDrivingMetricsData['1d']);
  const [performanceTrend, setPerformanceTrend] = React.useState(fakePerformanceTrendData['1d']);
  const [tripHistory, setTripHistory] = React.useState(fakeTripHistoryData['1d']);

  // Update all data when timeFrame changes
  React.useEffect(() => {
    setStats(fakeStatsData[timeFrame]);
    setDrivingMetrics(fakeDrivingMetricsData[timeFrame]);
    setPerformanceTrend(fakePerformanceTrendData[timeFrame]);
    setTripHistory(fakeTripHistoryData[timeFrame]);
    
    // TODO: Implement real API calls when backend is ready
    // fetch(`http://localhost:8000/api/customer-stats?timeFrame=${timeFrame}`)
    //   .then(response => response.json())
    //   .then(data => {
    //     setStats(data.stats);
    //     setDrivingMetrics(data.drivingMetrics);
    //     // etc.
    //   })
    //   .catch(error => console.error('Error fetching data:', error));
  }, [timeFrame]);

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">My Driving Dashboard</Typography>
        <TimeFilter onFilterChange={setTimeFrame} selectedFilter={timeFrame} />
      </Box>

      <Grid container spacing={3}>
        {/* Car Location Card */}
        <Grid item xs={12}>
          <CarLocation data={fakeCarLocationData} />
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
              <Typography variant="h4">{stats.averageScore}/100</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1, 
                color: stats.trend.averageScore >= 0 ? 'success.main' : 'error.main' 
              }}>
                {stats.trend.averageScore >= 0 ? 
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                }
                <Typography variant="body2">
                  {stats.trend.averageScore >= 0 ? '+' : ''}{stats.trend.averageScore} points from previous {timeFrame}
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
              <Typography variant="h4">{stats.milesDriven}</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                color: 'text.secondary'
              }}>
                <Typography variant="body2">
                  {stats.trend.milesDriven >= 0 ? '+' : ''}{stats.trend.milesDriven} miles from previous {timeFrame}
                </Typography>
              </Box>
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