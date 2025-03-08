// Overview.tsx
'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid'; // Changed from Unstable_Grid2
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
import { TimeFilter } from '@/components/dashboard-admin/overview/time-filter';
import { DrivingMetrics } from '@/components/dashboard-admin/overview/driving-metrics';
import { PerformanceTrend } from '@/components/dashboard-admin/overview/performance-trend';
import { DriversPerformance } from '@/components/dashboard-admin/overview/drivers-performance';
import { StatusBreakdown } from '@/components/dashboard-admin/overview/status-breakdown';

// Enhanced fake data for different time frames
const fakeStatsData = {
  '1d': {
    carsUsed: 45,
    averageAccidents: 2.3,
    averageScore: 85,
    trend: {
      carsUsed: +8,
      averageAccidents: -0.5,
      averageScore: +3
    }
  },
  '7d': {
    carsUsed: 156,
    averageAccidents: 3.1,
    averageScore: 82,
    trend: {
      carsUsed: +12,
      averageAccidents: +0.2,
      averageScore: -1
    }
  },
  '30d': {
    carsUsed: 487,
    averageAccidents: 2.8,
    averageScore: 84,
    trend: {
      carsUsed: +23,
      averageAccidents: -0.3,
      averageScore: +2
    }
  }
};

const fakeDrivingMetricsData = {
  '1d': {
    braking: 75,
    acceleration: 68,
    swerving: 82,
    speeding: 64
  },
  '7d': {
    braking: 82,
    acceleration: 74,
    swerving: 88,
    speeding: 70
  },
  '30d': {
    braking: 78,
    acceleration: 71,
    swerving: 85,
    speeding: 68
  }
};

const fakePerformanceTrendData = {
  '1d': {
    hours: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    scores: [82, 83, 88, 85, 78, 80, 84, 87]
  },
  '7d': {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    scores: [81, 83, 85, 82, 80, 88, 86]
  },
  '30d': {
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    scores: [83, 85, 82, 87]
  }
};

const fakeDriversPerformanceData = {
  '1d': {
    excellent: 18,
    good: 14,
    average: 8,
    poor: 5
  },
  '7d': {
    excellent: 65,
    good: 48,
    average: 27,
    poor: 16
  },
  '30d': {
    excellent: 187,
    good: 156,
    average: 89,
    poor: 55
  }
};

const fakeStatusData = {
  '1d': {
    active: 30,
    maintenance: 8,
    idle: 7
  },
  '7d': {
    active: 98,
    maintenance: 35,
    idle: 23
  },
  '30d': {
    active: 325,
    maintenance: 87,
    idle: 75
  }
};

export default function Overview(): React.JSX.Element {
  const [timeFrame, setTimeFrame] = React.useState<'1d' | '7d' | '30d'>('1d');
  const [stats, setStats] = React.useState(fakeStatsData['1d']);
  const [drivingMetrics, setDrivingMetrics] = React.useState(fakeDrivingMetricsData['1d']);
  const [performanceTrend, setPerformanceTrend] = React.useState(fakePerformanceTrendData['1d']);
  const [driversPerformance, setDriversPerformance] = React.useState(fakeDriversPerformanceData['1d']);
  const [statusData, setStatusData] = React.useState(fakeStatusData['1d']);

  // Update all data when timeFrame changes
  React.useEffect(() => {
    setStats(fakeStatsData[timeFrame]);
    setDrivingMetrics(fakeDrivingMetricsData[timeFrame]);
    setPerformanceTrend(fakePerformanceTrendData[timeFrame]);
    setDriversPerformance(fakeDriversPerformanceData[timeFrame]);
    setStatusData(fakeStatusData[timeFrame]);
    
    // TODO: Implement real API calls when backend is ready
    // fetch(`http://localhost:8000/api/overview-stats?timeFrame=${timeFrame}`)
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
                  Cars Used
                </Typography>
              </Box>
              <Typography variant="h4">{stats.carsUsed}</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1, 
                color: stats.trend.carsUsed >= 0 ? 'success.main' : 'error.main' 
              }}>
                {stats.trend.carsUsed >= 0 ? 
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                }
                <Typography variant="body2">
                  {stats.trend.carsUsed >= 0 ? '+' : ''}{stats.trend.carsUsed} from previous {timeFrame}
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
                  Average Accidents
                </Typography>
              </Box>
              <Typography variant="h4">{stats.averageAccidents.toFixed(1)}</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1, 
                color: stats.trend.averageAccidents <= 0 ? 'success.main' : 'error.main' 
              }}>
                {stats.trend.averageAccidents <= 0 ? 
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                }
                <Typography variant="body2">
                  {stats.trend.averageAccidents <= 0 ? '' : '+'}{stats.trend.averageAccidents.toFixed(1)} from previous {timeFrame}
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
        
        {/* Driving Metrics */}
        <Grid item xs={12} md={6}>
          <DrivingMetrics data={drivingMetrics} />
        </Grid>

        {/* Performance Trend */}
        <Grid item xs={12} md={6}>
          <PerformanceTrend timeFrame={timeFrame} data={performanceTrend} />
        </Grid>

        {/* Drivers Performance (replacing Risk Assessment) */}
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