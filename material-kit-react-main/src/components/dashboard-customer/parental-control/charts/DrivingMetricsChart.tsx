import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export interface DrivingMetricsData {
  date: string;
  harshBraking: number;
  hardAcceleration: number;
  swerving: number;
  overSpeed: number;
  score: number; // Add this missing property
}

interface DrivingMetricsChartProps {
  data: DrivingMetricsData[];
}

const DrivingMetricsChart: React.FC<DrivingMetricsChartProps> = ({ data }) => {
  // Get the most recent data point or calculate an average if multiple points
  const getMetricValue = (metric: keyof Omit<DrivingMetricsData, 'date'>): number => {
    if (data.length === 0) return 0;
    
    // If there's only one data point, use it
    if (data.length === 1) return data[0][metric];
    
    // Otherwise, calculate average of last 3 data points or fewer if less than 3 exist
    const recentPoints = data.slice(-3);
    const sum = recentPoints.reduce((acc, item) => acc + item[metric], 0);
    return Math.round(sum / recentPoints.length);
  };

  // Define metrics with their respective properties
  const metrics = [
    {
      id: 'harshBraking',
      label: 'Harsh Braking',
      value: getMetricValue('harshBraking'),
      color: '#f44336', // Red
      icon: <TrendingDownIcon sx={{ fontSize: 40, color: '#f44336' }} />
    },
    {
      id: 'hardAcceleration',
      label: 'Hard Acceleration',
      value: getMetricValue('hardAcceleration'),
      color: '#ff9800', // Orange
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#ff9800' }} />
    },
    {
      id: 'swerving',
      label: 'Swerving',
      value: getMetricValue('swerving'),
      color: '#2196f3', // Blue
      icon: <CompareArrowsIcon sx={{ fontSize: 40, color: '#2196f3' }} />
    },
    {
      id: 'overSpeed',
      label: 'Over Speed',
      value: getMetricValue('overSpeed'),
      color: '#4caf50', // Green
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#4caf50' }} />
    }
  ];

  // Function to create doughnut chart data for each metric
  const createChartData = (value: number, color: string): ChartData<'doughnut'> => {
    // Scale value for visualization purposes
    // The higher the count, the larger portion of the circle it will fill
    const scaledValue = Math.min(value, 30); // Cap at 30 for visualization
    const remainingValue = 30 - scaledValue;
    
    return {
      datasets: [{
        data: [scaledValue, remainingValue],
        backgroundColor: [
          color,
          '#f5f5f5' // Light gray for remainder
        ],
        borderWidth: 0,
        circumference: 270, // Create a gauge effect by showing only 270 degrees
        rotation: 225 // Start from bottom left
      }],
      labels: ['Events', '']
    };
  };

  // Common chart options
  const chartOptions = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (item: TooltipItem<'doughnut'>) => {
            if (item.dataIndex === 0) {
              return `Events: ${metrics[item.datasetIndex!].value}`;
            }
            return '';
          }
        }
      }
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      minHeight: { xs: 400, md: 400 }
    }}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
        Driving Behavior Metrics
      </Typography>
      
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              position: 'relative',
              height: 180
            }}>
              <Box sx={{ width: '100%', height: 160, position: 'relative' }}>
                <Doughnut 
                  data={createChartData(metric.value, metric.color)} 
                  options={chartOptions}
                />
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {metric.icon}
                  <Typography variant="h4" fontWeight="bold" color={metric.color}>
                    {metric.value}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" align="center" sx={{ mt: 1 }}>
                {metric.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default DrivingMetricsChart;