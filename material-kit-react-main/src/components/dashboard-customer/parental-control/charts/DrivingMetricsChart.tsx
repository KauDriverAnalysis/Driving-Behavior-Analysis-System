import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DrivingMetricsChartProps {
  data: any[];
}

const DrivingMetricsChart: React.FC<DrivingMetricsChartProps> = ({ data }) => {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      minHeight: { xs: 300, md: 400 }
    }}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Driving Metrics</Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="#1976d2" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="hardBrakes" 
              stroke="#f44336" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="suddenAccelerations" 
              stroke="#ff9800" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DrivingMetricsChart;