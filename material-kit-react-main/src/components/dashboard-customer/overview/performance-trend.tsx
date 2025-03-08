// PerformanceTrend.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PerformanceTrendProps {
  timeFrame: '1d' | '7d' | '30d';
  data: {
    hours?: string[];
    days?: string[];
    weeks?: string[];
    scores: number[];
  };
}

export function PerformanceTrend({ timeFrame, data }: PerformanceTrendProps) {
  const getCategories = () => {
    if (timeFrame === '1d') return data.hours;
    if (timeFrame === '7d') return data.days;
    return data.weeks;
  };

  const getLabel = () => {
    if (timeFrame === '1d') return 'Hours';
    if (timeFrame === '7d') return 'Days';
    return 'Weeks';
  };

  const chartOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 2
    },
    xaxis: {
      categories: getCategories(),
      labels: {
        style: {
          colors: '#64748B'
        }
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      min: Math.max(0, Math.min(...data.scores) - 10),
      max: Math.min(100, Math.max(...data.scores) + 10),
      labels: {
        style: {
          colors: '#64748B'
        }
      }
    },
    colors: ['#3F51B5'],
    tooltip: {
      y: {
        formatter: (value: number) => `${value} points`
      }
    }
  };

  const series = [{
    name: 'Average Score',
    data: data.scores
  }];

  const average = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
  const trend = data.scores[data.scores.length - 1] - data.scores[0];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Performance Trend
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Average score variation over {timeFrame === '1d' ? 'the day' : timeFrame === '7d' ? 'the week' : 'the month'}
            </Typography>
          </Box>

          <Box sx={{ height: 300 }}>
            {typeof window !== 'undefined' && (
              <Chart
                height={300}
                options={chartOptions}
                series={series}
                type="line"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Average
              </Typography>
              <Typography variant="h6">
                {average.toFixed(1)}
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
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}