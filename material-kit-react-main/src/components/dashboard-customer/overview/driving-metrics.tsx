import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface DrivingMetricsProps {
  data: {
    braking: number;
    acceleration: number;
    swerving: number;
    speeding: number;
  };
}

export function DrivingMetrics({ data }: DrivingMetricsProps) {
  const metricsData = [
    { name: 'Harsh Braking', value: data.braking, color: '#2196F3' },
    { name: 'Harsh Acceleration', value: data.acceleration, color: '#FF9800' },
    { name: 'Swerving', value: data.swerving, color: '#00C853' },
    { name: 'Speeding', value: data.speeding, color: '#F44336' }
  ];

  // Normalize data for chart visualization (0-100 scale)
  const maxValue = Math.max(...metricsData.map(item => item.value));
  const chartData = metricsData.map(item => ({
    subject: item.name,
    A: item.value > 0 ? Math.min(100, Math.max(10, (item.value / maxValue) * 100)) : 0,
    fullMark: 100,
    color: item.color
  }));

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Driving Performance Metrics
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Scores based on safety events detection
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }}}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#818E9B', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Events" 
                    dataKey="A" 
                    stroke="#3f51b5" 
                    fill="#3f51b5" 
                    fillOpacity={0.5} 
                  />
                  <Tooltip formatter={(value) => [value, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
            
            <Grid container spacing={2} sx={{ width: { xs: '100%', md: '50%' }, pl: { md: 3 } }}>
              {metricsData.map((metric) => (
                <Grid item xs={12} key={metric.name}>
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {metric.value}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    value={metric.value > 100 ? 100 : metric.value}
                    variant="determinate"
                    color="primary"
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default DrivingMetrics;