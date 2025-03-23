// DrivingMetrics.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DrivingMetricsProps {
  data: {
    braking: number;
    acceleration: number;
    swerving: number;
    speeding: number;
  };
}

export function DrivingMetrics({ data }: DrivingMetricsProps) {
  // Validate data and provide fallbacks
  const safeData = {
    braking: typeof data?.braking === 'number' ? data.braking : 0,
    acceleration: typeof data?.acceleration === 'number' ? data.acceleration : 0,
    swerving: typeof data?.swerving === 'number' ? data.swerving : 0,
    speeding: typeof data?.speeding === 'number' ? data.speeding : 0
  };
  
  // Calculate total events safely
  const totalEvents = safeData.braking + safeData.acceleration + safeData.swerving + safeData.speeding;
  
  // Calculate percentages
  const getPercentage = (value: number) => {
    if (totalEvents === 0) return 0;
    return Math.round((value / totalEvents) * 100);
  };
  
  const metricsData = [
    { name: 'Harsh Braking', value: safeData.braking, percentage: getPercentage(safeData.braking), color: '#2196F3' },
    { name: 'Harsh Acceleration', value: safeData.acceleration, percentage: getPercentage(safeData.acceleration), color: '#FF9800' },
    { name: 'Swerving', value: safeData.swerving, percentage: getPercentage(safeData.swerving), color: '#00C853' },
    { name: 'Speeding', value: safeData.speeding, percentage: getPercentage(safeData.speeding), color: '#F44336' }
  ];

  const radarChartOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: metricsData.map(item => item.name)
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    colors: metricsData.map(item => item.color),
    fill: {
      opacity: 0.5
    },
    stroke: {
      width: 2
    },
    markers: {
      size: 5
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeWidth: 1,
          strokeColor: '#E2E8F0',
          fill: {
            colors: ['#F8FAFC', '#F1F5F9']
          }
        }
      }
    }
  };

  const series = [{
    name: 'Percentage',
    data: metricsData.map(item => item.percentage)
  }];

  const hasValidData = totalEvents > 0;

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Driving Performance Metrics
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Percentage of each event type from total {totalEvents} events
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }}}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, height: '300px' }}>
              {hasValidData && typeof window !== 'undefined' ? (
                <Chart
                  height={300}
                  options={radarChartOptions}
                  series={series}
                  type="radar"
                />
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%' 
                  }}
                >
                  <Typography color="text.secondary">
                    No event data available
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Grid container spacing={2} sx={{ width: { xs: '100%', md: '50%' }, pl: { md: 3 } }}>
              {metricsData.map((metric) => (
                <Grid item xs={12} key={metric.name}>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.name} ({metric.value})
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {metric.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    value={metric.percentage}
                    variant="determinate"
                    color="primary"
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}