import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DrivingScoreChartProps {
  data: {
    date: string;
    score: number;
  }[];
  selectedCar: string;
}

const DrivingScoreChart: React.FC<DrivingScoreChartProps> = ({ data, selectedCar }) => {
  const theme = useTheme();
  
  // Don't render if we don't have data
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3, 
        mb: 3,
        minHeight: { xs: 300, md: 400 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color="text.secondary">No driving score data available</Typography>
      </Paper>
    );
  }

  // Process data for Recharts format
  const chartData = data.map(item => ({
    week: item.date,
    score: item.score
  }));
  
  // Calculate average score
  const scores = data.map(item => item.score);
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50'; // Green
    if (score >= 75) return '#2196f3'; // Blue
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const mainColor = getScoreColor(avgScore);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const color = getScoreColor(score);
      
      return (
        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          p: 1.5,
          borderRadius: 1,
          boxShadow: theme.shadows[3]
        }}>
          <Typography variant="body2" fontWeight="bold">
            Week: {label}
          </Typography>
          <Typography variant="body2" sx={{ color }}>
            Score: {score}/100
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3, 
      mb: 3,
      minHeight: { xs: 300, md: 400 }
    }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="medium">
          Weekly Driving Score
          {selectedCar && selectedCar !== 'all' && (
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              (Car #{selectedCar})
            </Typography>
          )}
        </Typography>
        
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: mainColor + '20', // 12% opacity
          border: `1px solid ${mainColor}`,
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: mainColor }}>
            {avgScore}/100
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        height: { xs: 250, md: 320 },
        width: '100%'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
            <XAxis 
              dataKey="week" 
              tick={{ fill: theme.palette.text.secondary }} 
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: theme.palette.text.secondary }} 
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="score" 
              radius={[6, 6, 0, 0]}
              barSize={25}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getScoreColor(entry.score)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DrivingScoreChart;