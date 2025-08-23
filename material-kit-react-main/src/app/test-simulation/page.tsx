'use client';

import * as React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { Simulation3D } from '@/components/dashboard-admin/Simulation/3DSimulation';

// Mock data for testing the 3D simulation
const mockData = [
  { time: '2025-01-01T00:00:00Z', lat: 40.7128, lng: -74.0060, speed: 45, event: '', score: 85 },
  { time: '2025-01-01T00:00:01Z', lat: 40.7129, lng: -74.0061, speed: 47, event: '', score: 82 },
  { time: '2025-01-01T00:00:02Z', lat: 40.7130, lng: -74.0062, speed: 52, event: '', score: 78 },
  { time: '2025-01-01T00:00:03Z', lat: 40.7131, lng: -74.0063, speed: 38, event: 'harsh_braking', score: 45 },
  { time: '2025-01-01T00:00:04Z', lat: 40.7132, lng: -74.0064, speed: 25, event: '', score: 55 },
  { time: '2025-01-01T00:00:05Z', lat: 40.7133, lng: -74.0065, speed: 35, event: '', score: 72 },
  { time: '2025-01-01T00:00:06Z', lat: 40.7134, lng: -74.0066, speed: 65, event: 'harsh_acceleration', score: 40 },
  { time: '2025-01-01T00:00:07Z', lat: 40.7135, lng: -74.0067, speed: 75, event: '', score: 35 },
  { time: '2025-01-01T00:00:08Z', lat: 40.7136, lng: -74.0068, speed: 68, event: 'swerving', score: 25 },
  { time: '2025-01-01T00:00:09Z', lat: 40.7137, lng: -74.0069, speed: 55, event: '', score: 60 },
  { time: '2025-01-01T00:00:10Z', lat: 40.7138, lng: -74.0070, speed: 95, event: 'over_speed', score: 20 },
  { time: '2025-01-01T00:00:11Z', lat: 40.7139, lng: -74.0071, speed: 85, event: '', score: 30 },
  { time: '2025-01-01T00:00:12Z', lat: 40.7140, lng: -74.0072, speed: 60, event: '', score: 70 },
  { time: '2025-01-01T00:00:13Z', lat: 40.7141, lng: -74.0073, speed: 45, event: '', score: 80 },
  { time: '2025-01-01T00:00:14Z', lat: 40.7142, lng: -74.0074, speed: 40, event: '', score: 85 },
];

export default function TestSimulationPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🚗 Enhanced 3D Vehicle Simulation Test
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Interactive 3D simulation with real-time accident detection and camera controls
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          🎮 Features Demonstrated:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li">🚨 Real-time accident detection and alerts</Typography>
          <Typography component="li">🎥 Interactive camera controls (free, follow modes)</Typography>
          <Typography component="li">📊 Enhanced vehicle visualization with event indicators</Typography>
          <Typography component="li">⚡ Variable playback speed controls</Typography>
          <Typography component="li">📱 Responsive fullscreen mode</Typography>
          <Typography component="li">🔄 3D/2D mode toggle</Typography>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 1 }}>
        <Simulation3D data={mockData} />
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          📋 Test Data Information:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Total data points: {mockData.length}<br />
          • Includes various driving events: harsh braking, acceleration, swerving, speeding<br />
          • Different risk levels and safety scores for comprehensive testing<br />
          • GPS coordinates simulate a realistic driving route<br />
          • Speed variations from 25-95 km/h to test accident detection thresholds
        </Typography>
      </Paper>
    </Container>
  );
}
