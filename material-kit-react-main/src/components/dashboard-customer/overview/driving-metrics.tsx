// DrivingMetrics.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'; // Changed from Unstable_Grid2
import LinearProgress from '@mui/material/LinearProgress';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DrivingMetricsProps {
  data: {
    braking: number;
    acceleration: number;
    swerving: number;
    speeding: number;
    score: number; // Add the score property

  };
}

export function DrivingMetrics({ data }: DrivingMetricsProps) {
  const metricsData = [
    { name: 'Harsh Braking', value: data.braking, color: '#2196F3' },
    { name: 'Harsh Acceleration', value: data.acceleration, color: '#FF9800' },
    { name: 'Swerving', value: data.swerving, color: '#00C853' },
    { name: 'Speeding', value: data.speeding, color: '#F44336' }
  ];

  const radarChartOptions: ApexOptions = {
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
          strokeWidth: '1',
          strokeColors: '#E2E8F0',  // Changed from strokeColor to strokeColors
          fill: {
            colors: ['#F8FAFC', '#F1F5F9']
          }
        }
      }
    }
  };

  const series = [{
    name: 'Score',
    data: metricsData.map(item => item.value)
  }];

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Driving Performance Metrics
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Scores based on safety events detection
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }}}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, height: '300px' }}>
              {typeof window !== 'undefined' && (
                <Chart
                  height={300}
                  options={radarChartOptions}
                  series={series}
                  type="radar"
                />
              )}
            </Box>
            
            <Grid container spacing={2} sx={{ width: { xs: '100%', md: '50%' }, pl: { md: 3 } }}>
              {metricsData.map((metric) => (
                <Grid item xs={12} key={metric.name}>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {metric.value}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    value={metric.value}
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