// DriversPerformance.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DriversPerformanceProps {
  data: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export function DriversPerformance({ data }: DriversPerformanceProps) {
  const totalDrivers = data.excellent + data.good + data.average + data.poor;
  
  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      stacked: true
    },
    colors: ['#4CAF50', '#2196F3', '#FF9800', '#F44336'],
    xaxis: {
      categories: ['Driver Performance'],
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${value}`
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '70%',
        dataLabels: {
          position: 'center'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        return `${((val / totalDrivers) * 100).toFixed(0)}%`;
      },
      style: {
        fontSize: '12px',
        colors: ['#FFF']
      }
    },
    stroke: {
      width: [0, 0, 0, 0] // Change to array of numbers for each series
    },
    legend: {
      position: 'bottom' as const,  // Add type assertion here
      fontSize: '14px',
      markers: {
        strokeWidth: 0,    // Changed from width
        size: 12,         // Changed from height
        shape: 'circle',  // Add shape property
        fillColors: undefined,  // Optional: let colors match the series
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 8
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} drivers (${((val / totalDrivers) * 100).toFixed(1)}%)`
      }
    }
  };

  const series = [
    {
      name: 'Excellent',
      data: [data.excellent]
    },
    {
      name: 'Good',
      data: [data.good]
    },
    {
      name: 'Average',
      data: [data.average]
    },
    {
      name: 'Poor',
      data: [data.poor]
    }
  ];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Drivers Performance
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Performance distribution based on safety metrics
            </Typography>
          </Box>
          
          <Box sx={{ height: 300 }}>
            {typeof window !== 'undefined' && (
              <Chart
                height={300}
                options={chartOptions}
                series={series}
                type="bar"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="success.main" fontWeight="medium">
                Excellent: {data.excellent} ({((data.excellent / totalDrivers) * 100).toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="info.main" fontWeight="medium">
                Good: {data.good} ({((data.good / totalDrivers) * 100).toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="warning.main" fontWeight="medium">
                Average: {data.average} ({((data.average / totalDrivers) * 100).toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="error.main" fontWeight="medium">
                Poor: {data.poor} ({((data.poor / totalDrivers) * 100).toFixed(1)}%)
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}