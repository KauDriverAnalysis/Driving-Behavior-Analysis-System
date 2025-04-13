'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

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

  // Safety check - ensure data exists
  const hasValidData = Boolean(data && 
    ((timeFrame === '1d' && data.hours && Array.isArray(data.hours) && data.hours.length > 0) ||
     (timeFrame === '7d' && data.days && Array.isArray(data.days) && data.days.length > 0) ||
     (timeFrame === '30d' && data.weeks && Array.isArray(data.weeks) && data.weeks.length > 0)));
  
  // Ensure scores is an array of valid numbers
  const scores = Array.isArray(data?.scores) 
    ? data.scores.map(score => Number(score) || 0) 
    : [];
  
  // Calculate real average from actual scores
  const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  // Prepare chart data
  const chartData = labels.map((label, index) => ({
    name: label,
    score: scores[index] || 0
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Trend
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
          Driving score over {timeFrame === '1d' ? 'the last 24 hours' : 
                          timeFrame === '7d' ? 'the last 7 days' : 
                          'the last 30 days'}
        </Typography>
        
        <Box sx={{ height: 300 }}>
          {hasValidData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#818E9B' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#818E9B' }}
                  tickFormatter={(value) => Math.round(value).toString()}
                />
                <Tooltip 
                  formatter={(value) => [Math.round(Number(value)), 'Score']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                {/* Reference line showing the real average */}
                <ReferenceLine 
                  y={average} 
                  stroke="#8884d8" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Avg: ${Math.round(average)}`, 
                    position: 'right',
                    fill: '#8884d8'
                  }}
                />
                <Line
                  type="linear"
                  dataKey="score"
                  stroke="#3f51b5"
                  strokeWidth={2}
                  dot={{
                    r: 6,
                    strokeWidth: 2,
                    fill: 'white',
                    stroke: '#3f51b5'
                  }}
                  activeDot={{ 
                    r: 8, 
                    stroke: '#3f51b5',
                    strokeWidth: 2,
                    fill: 'white'
                  }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No data available</Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Average Score: <Typography component="span" fontWeight="bold">{Math.round(average)}/100</Typography>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// Export both as named and default export for maximum compatibility
export { PerformanceTrend };
export default PerformanceTrend;