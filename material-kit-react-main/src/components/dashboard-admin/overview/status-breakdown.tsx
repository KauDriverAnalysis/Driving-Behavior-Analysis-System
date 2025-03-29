// StatusBreakdown.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CheckIcon from '@mui/icons-material/Check';
import ConstructionIcon from '@mui/icons-material/Construction';
import PauseIcon from '@mui/icons-material/Pause';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StatusBreakdownProps {
  data: {
    active: number;
    maintenance: number;
    idle: number;
  };
}

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  const totalCars = data.active + data.maintenance + data.idle;
  
  const barChartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false, // Change to false to show separate bars
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: false,
        columnWidth: '70%',
        barHeight: '70%',
        dataLabels: {
          position: 'center' as const,  // Changed from 'top' to 'center' with type assertion
          maxItems: 100,
          hideOverflowingLabels: false,
          orientation: 'horizontal'
        }
      }
    },
    colors: ['#4CAF50', '#FF9800', '#9E9E9E'],
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val; // Show the actual number
      },
      offsetX: 0, // Reset the offset
      textAnchor: 'start' as const, // Add type assertion here
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    stroke: {
      width: 0
    },
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    xaxis: {
      categories: ['Vehicle Count'],
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
        show: false
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} cars`
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    }
  };

  // Keep the same series data structure
  const series = [
    {
      name: 'Active',
      data: [data.active]
    },
    {
      name: 'Maintenance',
      data: [data.maintenance]
    },
    {
      name: 'Idle',
      data: [data.idle]
    }
  ];

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Car Status Breakdown
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Current status of all company vehicles ({totalCars} total)
            </Typography>
          </Box>
          
          <Box sx={{ height: 150 }}>
            {typeof window !== 'undefined' && (
              <Chart
                height={150}
                options={barChartOptions}
                series={series}
                type="bar"
              />
            )}
          </Box>
          
          <Grid container spacing={2}>
            <Grid xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  icon={<CheckIcon />}
                  label="Active"
                  color="success"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5">{data.active}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalCars > 0 ? `${((data.active / totalCars) * 100).toFixed(0)}%` : '0%'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  icon={<ConstructionIcon />}
                  label="Maintenance"
                  color="warning"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5">{data.maintenance}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalCars > 0 ? `${((data.maintenance / totalCars) * 100).toFixed(0)}%` : '0%'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  icon={<PauseIcon />}
                  label="Idle"
                  color="default"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5">{data.idle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalCars > 0 ? `${((data.idle / totalCars) * 100).toFixed(0)}%` : '0%'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}