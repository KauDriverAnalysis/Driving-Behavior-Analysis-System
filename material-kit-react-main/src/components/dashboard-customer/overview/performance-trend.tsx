'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues with proper typing
const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Loading chart...</Typography>
  </Box>
});

interface PerformanceTrendData {
  hours?: string[];
  days?: string[];
  weeks?: string[];
  scores: number[];
}

interface PerformanceTrendProps {
  timeFrame: '1d' | '7d' | '30d';
  data: PerformanceTrendData;
}

function PerformanceTrend({ timeFrame, data }: PerformanceTrendProps) {
  // Get the appropriate labels based on timeFrame
  const getLabels = () => {
    if (timeFrame === '1d' && data?.hours) return data.hours;
    if (timeFrame === '7d' && data?.days) return data.days;
    if (timeFrame === '30d' && data?.weeks) return data.weeks;
    return [];
  };

  const labels = getLabels();

  // Safety check - ensure data exists and has the expected format
  const hasValidData = Boolean(data && 
    ((timeFrame === '1d' && data.hours && Array.isArray(data.hours) && data.hours.length > 0) ||
     (timeFrame === '7d' && data.days && Array.isArray(data.days) && data.days.length > 0) ||
     (timeFrame === '30d' && data.weeks && Array.isArray(data.weeks) && data.weeks.length > 0)));

  // Ensure scores is an array of valid numbers
  const scores = Array.isArray(data?.scores) 
    ? data.scores.map(score => Number(score) || 0) 
    : [];
  
  // Calculate average and trend only if we have valid data
  const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  // Calculate trend as difference between last and first value
  const trend = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
  
  // Chart options with safe data
  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#EAEDF2',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    theme: {
      mode: 'light'
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val: number): string {
          return Math.round(val).toString();
        }
      }
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      categories: labels,
      labels: {
        style: {
          colors: '#818E9B'
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: {
          colors: '#818E9B'
        },
        formatter: function(val: number): string {
          return Math.round(val).toString();
        }
      }
    }
  };

  const series = [{
    name: 'Score',
    data: scores
  }];

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Performance Trend
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Driving score over {timeFrame === '1d' ? 'the last 24 hours' : 
                              timeFrame === '7d' ? 'the last 7 days' : 
                              'the last 30 days'}
            </Typography>
          </Box>
          
          <Box sx={{ height: 300 }}>
            {hasValidData ? (
              <ReactApexChart 
                height={300}
                options={chartOptions}
                series={series}
                type="line"
              />
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Average
              </Typography>
              <Typography variant="h6">
                {Math.round(average)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Trend
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}
              >
                {trend >= 0 ? '+' : ''}{Math.round(trend)}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Export both as named and default export for maximum compatibility
export { PerformanceTrend };
export default PerformanceTrend;