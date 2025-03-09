import * as React from 'react';
import { Card, CardHeader, CardContent, Typography, Divider, Box, Grid, Avatar, IconButton, Tooltip, Fade, Paper } from '@mui/material';
import { Car, AlertTriangle, Activity, Route, Shield, X, ArrowDown, Zap, CornerDownRight, Wind, AlertCircle } from 'lucide-react';

interface DrivingDataDetail {
  car_id: string;
  distance: number;
  harsh_braking_events: number;
  harsh_acceleration_events: number;
  swerving_events: number;
  potential_swerving_events: number;
  over_speed_events: number;
  score: number;
}

interface CarDetailPanelProps {
  data: DrivingDataDetail;
}

export default function CarDetailPanel({ data }: CarDetailPanelProps): React.JSX.Element {
  // Function to determine severity level based on event count
  const getSeverityLevel = (count: number) => {
    if (count <= 30) return { color: '#4caf50', level: 'Low' };
    if (count <= 100) return { color: '#ff9800', level: 'Medium' };
    return { color: '#f44336', level: 'High' };
  };

  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  // Calculate total events for summary
  const totalEvents = 
    data.harsh_braking_events + 
    data.harsh_acceleration_events + 
    data.swerving_events + 
    data.over_speed_events;

  return (
    <Fade in={true} timeout={500}>
      <Card sx={{ 
        mt: 3, 
        borderRadius: 2, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* Avatar Badge */}
        <Box sx={{ position: 'absolute', top: -20, left: 20, zIndex: 10 }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.main', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <Car size={28} />
          </Avatar>
        </Box>
        
        {/* Header with Score */}
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 7 }}>
              <Typography variant="h6" component="div">Vehicle {data.car_id} Details</Typography>
              <Box sx={{ 
                ml: 2, 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: getScoreColor(data.score),
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1
              }}>
                <Typography variant="body2" fontWeight="bold">Score: {data.score}</Typography>
              </Box>
            </Box>
          }
          action={
            <Tooltip title="Close details">
              <IconButton>
                <X size={20} />
              </IconButton>
            </Tooltip>
          }
        />
        
        <Divider />
        
        <CardContent sx={{ pt: 3 }}>
          {/* Primary Metrics Row */}
          <Grid container spacing={2} mb={4}>
            {/* Distance Card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#f5f9ff',
                border: '1px solid #e0e9f7'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Route size={24} color="#2196f3" />
                </Box>
                <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
                  {data.distance.toFixed(1)} km
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Distance</Typography>
              </Paper>
            </Grid>
            
            {/* Safety Score Card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#f8fcf8',
                border: '1px solid #e3f2e3'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Shield size={24} color={getScoreColor(data.score)} />
                </Box>
                <Typography variant="h4" sx={{ color: getScoreColor(data.score) }} fontWeight="bold" gutterBottom>
                  {data.score}/100
                </Typography>
                <Typography variant="body2" color="text.secondary">Safety Score</Typography>
              </Paper>
            </Grid>
            
            {/* Total Events Card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#fff9f9',
                border: '1px solid #ffe7e7'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AlertTriangle size={24} color="#f44336" />
                </Box>
                <Typography variant="h4" color="error.main" fontWeight="bold" gutterBottom>
                  {totalEvents}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Events</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom mt={2}>
            Detailed Event Metrics
          </Typography>
          
          {/* Event Metrics - Numeric Blocks */}
          <Grid container spacing={2} mt={1}>
            {/* Harsh Braking */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: `4px solid ${getSeverityLevel(data.harsh_braking_events).color}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, width: '100%' }}>
                  <ArrowDown size={18} color="#f44336" style={{ marginRight: 10 }} />
                  <Typography variant="subtitle2">Harsh Braking</Typography>
                </Box>
                
                <Typography variant="h3" fontWeight="medium" align="center">
                  {data.harsh_braking_events}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" mt={1} sx={{ 
                  bgcolor: getSeverityLevel(data.harsh_braking_events).color + '20',
                  color: getSeverityLevel(data.harsh_braking_events).color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'medium'
                }}>
                  {getSeverityLevel(data.harsh_braking_events).level} Risk
                </Typography>
              </Paper>
            </Grid>
            
            {/* Harsh Acceleration */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: `4px solid ${getSeverityLevel(data.harsh_acceleration_events).color}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, width: '100%' }}>
                  <Zap size={18} color="#ff9800" style={{ marginRight: 10 }} />
                  <Typography variant="subtitle2">Harsh Acceleration</Typography>
                </Box>
                
                <Typography variant="h3" fontWeight="medium" align="center">
                  {data.harsh_acceleration_events}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" mt={1} sx={{ 
                  bgcolor: getSeverityLevel(data.harsh_acceleration_events).color + '20',
                  color: getSeverityLevel(data.harsh_acceleration_events).color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'medium'
                }}>
                  {getSeverityLevel(data.harsh_acceleration_events).level} Risk
                </Typography>
              </Paper>
            </Grid>
            
            {/* Swerving */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: `4px solid ${getSeverityLevel(data.swerving_events).color}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, width: '100%' }}>
                  <CornerDownRight size={18} color="#2196f3" style={{ marginRight: 10 }} />
                  <Typography variant="subtitle2">Swerving</Typography>
                </Box>
                
                <Typography variant="h3" fontWeight="medium" align="center">
                  {data.swerving_events}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" mt={1} sx={{ 
                  bgcolor: getSeverityLevel(data.swerving_events).color + '20',
                  color: getSeverityLevel(data.swerving_events).color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'medium'
                }}>
                  {getSeverityLevel(data.swerving_events).level} Risk
                </Typography>
              </Paper>
            </Grid>
            
            {/* Potential Swerving */}
            <Grid item xs={12} sm={6} md={6}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: `4px solid ${getSeverityLevel(data.potential_swerving_events).color}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, width: '100%' }}>
                  <Wind size={18} color="#7e57c2" style={{ marginRight: 10 }} />
                  <Typography variant="subtitle2">Potential Swerving Events</Typography>
                </Box>
                
                <Typography variant="h3" fontWeight="medium" align="center">
                  {data.potential_swerving_events}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" mt={1} sx={{ 
                  bgcolor: getSeverityLevel(data.potential_swerving_events).color + '20',
                  color: getSeverityLevel(data.potential_swerving_events).color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'medium'
                }}>
                  {getSeverityLevel(data.potential_swerving_events).level} Risk
                </Typography>
              </Paper>
            </Grid>
            
            {/* Over Speed */}
            <Grid item xs={12} sm={6} md={6}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: `4px solid ${getSeverityLevel(data.over_speed_events).color}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, width: '100%' }}>
                  <AlertCircle size={18} color="#9c27b0" style={{ marginRight: 10 }} />
                  <Typography variant="subtitle2">Over Speed Events</Typography>
                </Box>
                
                <Typography variant="h3" fontWeight="medium" align="center">
                  {data.over_speed_events}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" mt={1} sx={{ 
                  bgcolor: getSeverityLevel(data.over_speed_events).color + '20',
                  color: getSeverityLevel(data.over_speed_events).color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'medium'
                }}>
                  {getSeverityLevel(data.over_speed_events).level} Risk
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );
}