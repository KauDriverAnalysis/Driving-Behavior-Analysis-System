'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { TimeFilter } from '@/components/dashboard-admin/overview/time-filter';
import { DrivingMetrics } from '@/components/dashboard-admin/overview/driving-metrics';
import { PerformanceTrend } from '@/components/dashboard-admin/overview/performance-trend';
import { DriversPerformance } from '@/components/dashboard-admin/overview/drivers-performance';
import { StatusBreakdown } from '@/components/dashboard-admin/overview/status-breakdown';

export default function Overview(): React.JSX.Element {
  const [timeFrame, setTimeFrame] = useState<'1d' | '7d' | '30d'>('1d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  
  // Previous data structure for fallback if needed
  const [stats, setStats] = useState({
    carsUsed: 0,
    averageAccidents: 0,
    averageScore: 0,
    trend: {
      carsUsed: 0,
      averageAccidents: 0,
      averageScore: 0
    }
  });
  const [drivingMetrics, setDrivingMetrics] = useState({
    braking: 0,
    acceleration: 0,
    swerving: 0,
    speeding: 0
  });
  const [performanceTrend, setPerformanceTrend] = useState({
    hours: ['00:00'],
    scores: [0]
  });
  const [driversPerformance, setDriversPerformance] = useState({
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0
  });
  const [statusData, setStatusData] = useState({
    active: 0,
    maintenance: 0,
    idle: 0
  });

  // Fetch data from the API
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Get company ID from localStorage
    const companyId = localStorage.getItem('company_id') || 
                     localStorage.getItem('companyId') || 
                     localStorage.getItem('employee-company-id');
    
    // Add company_id parameter to filter cars for this company only
    fetch(`https://driving-behavior-analysis-system.onrender.com/api/fleet-overview/?time_frame=${timeFrame}&company_id=${companyId || ''}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`API data received for ${timeFrame}:`, data);
        setOverviewData(data);
        
        // Map API data to component state
        setStats({
          carsUsed: data?.fleet_stats?.total_cars || 0,
          averageAccidents: data?.events?.total_events || 0,
          averageScore: data?.fleet_stats?.avg_score || 0,
          trend: {
            carsUsed: data?.fleet_stats?.trend?.cars_used || 0,
            averageAccidents: data?.events?.trend?.total_events || 0,
            averageScore: data?.fleet_stats?.trend?.avg_score || 0
          }
        });
        
        setDrivingMetrics({
          braking: data?.events?.harsh_braking || 0,
          acceleration: data?.events?.harsh_acceleration || 0,
          swerving: data?.events?.swerving || 0,
          speeding: data?.events?.over_speed || 0
        });
        
        // Use actual historical data if available
        if (data.historical_scores && data.historical_scores.length > 0) {
          const labels = data.historical_scores.map(item => item.time_label);
          const scores = data.historical_scores.map(item => item.score);
          
          setPerformanceTrend(
            timeFrame === '1d' ? { hours: labels, scores } : 
            (timeFrame === '7d' ? { days: labels, scores } : 
            { weeks: labels, scores })
          );
        } else {
          // Fallback to simulated data
          const trendLabels = timeFrame === '1d' ? 
            ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] : 
            (timeFrame === '7d' ? 
              ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : 
              ['Week 1', 'Week 2', 'Week 3', 'Week 4']);
          
          // Generate scores array from historical data or use average score
          const avgScore = data.fleet_stats.avg_score;
          const scores = trendLabels.map((_, index) => {
            // Simulate slight variation around average to create a chart
            return Math.max(0, Math.min(100, avgScore + (Math.random() * 10 - 5)));
          });
          
          setPerformanceTrend(
            timeFrame === '1d' ? { hours: trendLabels, scores } : 
            (timeFrame === '7d' ? { days: trendLabels, scores } : 
            { weeks: trendLabels, scores })
          );
        }
        
        // Map driver performance from API data
        // Using best and worst drivers lists
        if (data.best_drivers && data.worst_drivers) {
          // Calculate driver counts based on score ranges
          let excellent = 0, good = 0, average = 0, poor = 0;
          
          // Process best drivers
          data.best_drivers.forEach(driver => {
            if (driver.score >= 90) excellent++;
            else if (driver.score >= 80) good++;
            else if (driver.score >= 70) average++;
            else poor++;
          });
          
          // Process worst drivers
          data.worst_drivers.forEach(driver => {
            if (driver.score >= 90) excellent++;
            else if (driver.score >= 80) good++;
            else if (driver.score >= 70) average++;
            else poor++;
          });
          
          setDriversPerformance({
            excellent,
            good,
            average,
            poor
          });
        }

        // Use real driver performance data
        if (data.drivers) {
          setDriversPerformance({
            excellent: data.drivers.excellent || 0,
            good: data.drivers.good || 0,
            average: data.drivers.average || 0,
            poor: data.drivers.poor || 0
          });
        }
        
        setStatusData({
          active: data?.fleet_stats?.active_cars || 0,
          idle: data?.fleet_stats?.inactive_cars || 0,
          maintenance: data?.fleet_stats?.maintenance_cars || 0
        });
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching overview data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      });
      
    // Set up polling interval to refresh data every 15 seconds
    const intervalId = setInterval(() => {
      fetch(`https://driving-behavior-analysis-system.onrender.com/api/fleet-overview/?time_frame=${timeFrame}`)
        .then(response => response.json())
        .then(data => {
          setOverviewData(data);
          // Update all the state as above...

          // Use real driver performance data from the updated API
          if (data.drivers) {
            setDriversPerformance({
              excellent: data.drivers.excellent || 0,
              good: data.drivers.good || 0,
              average: data.drivers.average || 0,
              poor: data.drivers.poor || 0
            });
            
            console.log("Driver performance categories:", {
              excellent: data.drivers.excellent || 0,
              good: data.drivers.good || 0,
              average: data.drivers.average || 0,
              poor: data.drivers.poor || 0
            });
            
            // You can also log all driver data to debug
            console.log("All drivers with scores:", data.drivers.all_drivers);
          }
        })
        .catch(err => console.error('Error in periodic data update:', err));
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [timeFrame]);

  if (loading && !overviewData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Fleet Overview</Typography>
        <TimeFilter onFilterChange={setTimeFrame} selectedFilter={timeFrame} />
      </Box>

      <Grid container spacing={3}>
        {/* Key Stats Cards */}
        <Grid item lg={4} sm={6} xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DirectionsCarIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography color="text.secondary" variant="overline">
                  Total Vehicles
                </Typography>
              </Box>
              <Typography variant="h4">{stats.carsUsed}</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1, 
                color: 'text.secondary'
              }}>
                <Typography variant="body2">
                 {overviewData?.fleet_stats?.active_cars || 0} active vehicles
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item lg={4} sm={6} xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography color="text.secondary" variant="overline">
                  Total Events
                </Typography>
              </Box>
              <Typography variant="h4">{stats.averageAccidents}</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                color: 'text.secondary'
              }}>
                <Typography variant="body2">
                  Combined safety events
                </Typography>
              </Box>
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
                color: 'text.secondary'
              }}>
                <Typography variant="body2">
                  Fleet average performance
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

        {/* Drivers Performance */}
        <Grid item xs={12} md={6}>
          <DriversPerformance data={driversPerformance} />
        </Grid>
        
        {/* Car Status Breakdown */}
        <Grid item xs={12} md={6}>
          <StatusBreakdown data={statusData} />
        </Grid>
      </Grid>
    </Box>
  );
}