import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DrivingMetricsData {
  date: string;
  harshBraking: number;
  hardAcceleration: number;
  swerving: number;
  overSpeed: number;
}

interface DrivingMetricsChartProps {
  data: DrivingMetricsData[];
}

const DrivingMetricsChart: React.FC<DrivingMetricsChartProps> = ({ data }) => {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      minHeight: { xs: 300, md: 400 }
    }}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Driving Behavior Metrics</Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string | number) => [
                value, 
                typeof name === 'string' ? name.replace(/([A-Z])/g, ' $1').trim() : name
              ]}
            />
            <Legend 
              formatter={(value: string | number) => 
                typeof value === 'string' ? value.replace(/([A-Z])/g, ' $1').trim() : value
              } 
            />
            <Line 
              type="monotone" 
              dataKey="harshBraking" 
              stroke="#f44336" // Red
              strokeWidth={2}
              name="Harsh Braking"
            />
            <Line 
              type="monotone" 
              dataKey="hardAcceleration" 
              stroke="#ff9800" // Orange
              strokeWidth={2}
              name="Hard Acceleration"
            />
            <Line 
              type="monotone" 
              dataKey="swerving" 
              stroke="#2196f3" // Blue
              strokeWidth={2}
              name="Swerving"
            />
            <Line 
              type="monotone" 
              dataKey="overSpeed" 
              stroke="#4caf50" // Green
              strokeWidth={2}
              name="Over Speed"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DrivingMetricsChart;