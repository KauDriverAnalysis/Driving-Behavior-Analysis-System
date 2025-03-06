import * as React from 'react';
import { Card, CardHeader, CardContent, Typography, Divider, Box, Grid, LinearProgress,Avatar,IconButton,Tooltip,Fade,Paper} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import RouteIcon from '@mui/icons-material/Route';
import BrakeIcon from '@mui/icons-material/Error';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface DrivingDataDetail {
  car_id: string;
  distance: number;
  harsh_braking_events: number;
  harsh_acceleration_events: number;
  swerving_events: number;
  potential_swerving_events: number;
  over_speed_events: number;
  score: number;
  // Add any other fields you need
}

interface CarDetailPanelProps {
  data: DrivingDataDetail;
}

export default function CarDetailPanel({ data }: CarDetailPanelProps): React.JSX.Element {
  // Function to determine severity level based on event count
  const getSeverityLevel = (count: number) => {
    if (count <= 2) return { color: 'success.main', level: 'Low' };
    if (count <= 5) return { color: 'warning.main', level: 'Medium' };
    return { color: 'error.main', level: 'High' };
  };

  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
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
        <Box 
          sx={{ 
            position: 'absolute',
            top: -20,
            left: 20,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Avatar 
            sx={{ 
              width: 52, 
              height: 52, 
              backgroundColor: 'primary.main',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <DirectionsCarIcon />
          </Avatar>
        </Box>
        
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 7 }}>
              <Typography variant="h6" component="div">
                Vehicle {data.car_id} Details
              </Typography>
              <Box 
                sx={{ 
                  ml: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: getScoreColor(data.score),
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Score: {data.score}
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Tooltip title="Close details">
              <IconButton>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          }
        />
        
        <Divider />
        
        <CardContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    height: '100%',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    border: '1px solid rgba(74, 144, 226, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RouteIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Distance
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {data.distance.toFixed(1)} <span style={{ fontSize: '16px' }}>km</span>
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    height: '100%',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    border: '1px solid rgba(255, 152, 0, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SpeedIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Speed Violations
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {data.over_speed_events}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    height: '100%',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Total Events
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {totalEvents}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Driving Behavior Analysis
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Harsh Braking */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BrakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">Harsh Braking</Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getSeverityLevel(data.harsh_braking_events).color,
                      fontWeight: 'bold'
                    }}
                  >
                    {getSeverityLevel(data.harsh_braking_events).level}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(data.harsh_braking_events * 10, 100)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.09)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSeverityLevel(data.harsh_braking_events).color
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                    {data.harsh_braking_events}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Harsh Acceleration */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">Harsh Acceleration</Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getSeverityLevel(data.harsh_acceleration_events).color,
                      fontWeight: 'bold'
                    }}
                  >
                    {getSeverityLevel(data.harsh_acceleration_events).level}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(data.harsh_acceleration_events * 10, 100)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.09)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSeverityLevel(data.harsh_acceleration_events).color
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                    {data.harsh_acceleration_events}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Swerving Events */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChartIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">Swerving Events</Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getSeverityLevel(data.swerving_events).color,
                      fontWeight: 'bold'
                    }}
                  >
                    {getSeverityLevel(data.swerving_events).level}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(data.swerving_events * 10, 100)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.09)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSeverityLevel(data.swerving_events).color
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                    {data.swerving_events}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Potential Swerving */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChartIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">Potential Swerving</Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getSeverityLevel(data.potential_swerving_events).color,
                      fontWeight: 'bold'
                    }}
                  >
                    {getSeverityLevel(data.potential_swerving_events).level}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(data.potential_swerving_events * 10, 100)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.09)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSeverityLevel(data.potential_swerving_events).color
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                    {data.potential_swerving_events}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Over Speed Events */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">Over Speed Events</Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getSeverityLevel(data.over_speed_events).color,
                      fontWeight: 'bold'
                    }}
                  >
                    {getSeverityLevel(data.over_speed_events).level}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(data.over_speed_events * 10, 100)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.09)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSeverityLevel(data.over_speed_events).color
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                    {data.over_speed_events}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );
}