'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
  Avatar
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import SensorsIcon from '@mui/icons-material/Sensors';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface SimulationResultsProps {
  data: {
    summary: any;
    events: any;
    chartData: any[];
    segments: any[];
  };
}

export function SimulationResults({ data }: SimulationResultsProps) {
  const { summary, chartData, segments } = data;

  // Enhanced accident detection logic
  const detectAccidentWithDetails = () => {
    if (summary.accident_detected !== undefined) {
      return {
        detected: summary.accident_detected,
        confidence: summary.accident_confidence || 85,
        type: summary.accident_type || 'Unknown',
        severity: summary.accident_severity || 'Medium',
        timestamp: summary.accident_timestamp || 'Unknown'
      };
    }

    // Analyze segments for accident patterns
    const accidentIndicators = segments.map((segment, index) => {
      const suddenStop = segment.speed < 10 && index > 0 && segments[index - 1].speed > 50;
      const highDeceleration = segment.ax < -8; // Strong deceleration
      const erraticMovement = Math.abs(segment.ay) > 6 || Math.abs(segment.gx) > 150;
      
      return {
        index,
        time: segment.time,
        suddenStop,
        highDeceleration,
        erraticMovement,
        riskScore: (suddenStop ? 30 : 0) + (highDeceleration ? 40 : 0) + (erraticMovement ? 30 : 0)
      };
    }).filter(indicator => indicator.riskScore > 50);

    const detected = accidentIndicators.length > 0;
    
    return {
      detected,
      confidence: detected ? Math.min(95, 60 + accidentIndicators.length * 10) : 15,
      type: detected ? 'Collision/Impact' : 'No Accident',
      severity: accidentIndicators.length > 2 ? 'High' : accidentIndicators.length > 0 ? 'Medium' : 'Low',
      timestamp: accidentIndicators.length > 0 ? accidentIndicators[0].time : 'N/A',
      indicators: accidentIndicators
    };
  };

  const accidentAnalysis = detectAccidentWithDetails();

  // Prepare G-force visualization data
  const gForceData = segments.map(segment => ({
    time: segment.time,
    lateral: Math.abs(segment.ay || 0),
    longitudinal: Math.abs(segment.ax || 0),
    vertical: Math.abs(segment.az || 0),
    total: Math.sqrt((segment.ax || 0) ** 2 + (segment.ay || 0) ** 2 + (segment.az || 0) ** 2)
  }));

  // Speed profile for accident analysis
  const speedProfileData = chartData.map(point => ({
    ...point,
    dangerZone: point.speed > 80 ? point.speed : null,
    safeZone: point.speed <= 80 ? point.speed : null
  }));

  return (
    <Box>
      {/* Accident Detection Status */}
      <Card sx={{ mb: 3, border: accidentAnalysis.detected ? '2px solid #f44336' : '2px solid #4caf50' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: accidentAnalysis.detected ? 'error.main' : 'success.main',
                    mb: 2
                  }}
                >
                  {accidentAnalysis.detected ? 
                    <CrisisAlertIcon sx={{ fontSize: 40 }} /> : 
                    <CheckCircleIcon sx={{ fontSize: 40 }} />
                  }
                </Avatar>
                <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  color={accidentAnalysis.detected ? 'error.main' : 'success.main'}
                >
                  {accidentAnalysis.detected ? 'ACCIDENT DETECTED' : 'SAFE JOURNEY'}
                </Typography>
                <Chip 
                  label={`${accidentAnalysis.confidence}% Confidence`}
                  color={accidentAnalysis.detected ? 'error' : 'success'}
                  variant="filled"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="h6" fontWeight="bold">{accidentAnalysis.type}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Severity</Typography>
                  <Chip 
                    label={accidentAnalysis.severity}
                    color={
                      accidentAnalysis.severity === 'High' ? 'error' :
                      accidentAnalysis.severity === 'Medium' ? 'warning' : 'success'
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Time</Typography>
                  <Typography variant="body1">{accidentAnalysis.timestamp}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Max Speed</Typography>
                  <Typography variant="h6" color={summary.maxSpeed > 100 ? 'error.main' : 'inherit'}>
                    {summary.maxSpeed.toFixed(0)} km/h
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Speed Profile Analysis */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1 }} />
                Speed Profile Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={speedProfileData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="safeZone" 
                      stackId="1"
                      stroke="#4caf50" 
                      fill="#4caf50"
                      fillOpacity={0.6}
                      name="Safe Speed"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="dangerZone" 
                      stackId="1"
                      stroke="#f44336" 
                      fill="#f44336"
                      fillOpacity={0.8}
                      name="Dangerous Speed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Accident Indicators */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SensorsIcon sx={{ mr: 1 }} />
                Accident Indicators
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingDownIcon color={summary.maxSpeed > 120 ? 'error' : 'success'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Excessive Speed"
                    secondary={summary.maxSpeed > 120 ? 'Risk detected' : 'Within limits'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ShowChartIcon color={accidentAnalysis.indicators?.length > 0 ? 'error' : 'success'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sudden Movements"
                    secondary={accidentAnalysis.indicators?.length > 0 ? `${accidentAnalysis.indicators.length} detected` : 'None detected'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Journey Duration"
                    secondary={`${summary.duration} minutes`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Distance Covered"
                    secondary={`${summary.distance.toFixed(1)} km`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* G-Force Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                G-Force Impact Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gForceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="lateral" 
                      stroke="#2196f3" 
                      strokeWidth={2}
                      name="Lateral G-Force"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="longitudinal" 
                      stroke="#ff9800" 
                      strokeWidth={2}
                      name="Longitudinal G-Force"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#f44336" 
                      strokeWidth={3}
                      name="Total G-Force"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trip Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trip Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.totalRecords.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data Points
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.avgSpeed.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Speed (km/h)
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: accidentAnalysis.detected ? 'error.50' : 'success.50' }}>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold"
                      color={accidentAnalysis.detected ? 'error.main' : 'success.main'}
                    >
                      {accidentAnalysis.detected ? 'HIGH' : 'LOW'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Risk Assessment
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {accidentAnalysis.confidence}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Detection Confidence
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 