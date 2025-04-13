import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DrivingScoreChartProps {
  data: any[];
}

const DrivingScoreChart: React.FC<DrivingScoreChartProps> = ({ data }) => {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3, 
      mb: 3,
      minHeight: { xs: 300, md: 400 }
    }}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
        Weekly Driving Score
      </Typography>
      <Box sx={{ 
        height: { xs: 300, md: 400 },
        width: '100%'
      }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#1976d2" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DrivingScoreChart;