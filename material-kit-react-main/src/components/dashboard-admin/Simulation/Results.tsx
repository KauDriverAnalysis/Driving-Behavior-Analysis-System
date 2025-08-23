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
  ListItemText
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WarningIcon from '@mui/icons-material/Warning';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SimulationResultsProps {
  data: {
    summary: any;
    events: any;
    chartData: any[];
    segments: any[];
  };
}

export function SimulationResults({ data }: SimulationResultsProps) {
  const { summary, events, chartData } = data;

  // Calculate percentages for events
  const totalEvents = Object.values(events).reduce((a: number, b: number) => a + b, 0);
  
  // Detect accident based on harsh events and other indicators
  const detectAccident = () => {
    // Check if there's an explicit accident flag in summary
    if (summary.accident_detected !== undefined) {
      return summary.accident_detected;
    }
    
    // Otherwise, detect based on multiple harsh events occurring together
    const severityThreshold = {
      harshBraking: 5,
      harshAcceleration: 5,
      swerving: 3,
      overSpeed: 10
    };
    
    const severeCombination = 
      (events.harshBraking >= severityThreshold.harshBraking && events.swerving >= severityThreshold.swerving) ||
      (events.harshBraking >= severityThreshold.harshBraking && events.harshAcceleration >= severityThreshold.harshAcceleration) ||
      (events.swerving >= severityThreshold.swerving && events.overSpeed >= severityThreshold.overSpeed) ||
      (events.harshBraking >= 10) || // Very high braking events
      (events.swerving >= 8); // Very high swerving events
    
    return severeCombination;
  };

  const accidentDetected = detectAccident();
  
  const eventData = [
    { name: 'Harsh Braking', value: events.harshBraking, color: '#f44336' },
    { name: 'Hard Acceleration', value: events.harshAcceleration, color: '#ff9800' },
    { name: 'Swerving', value: events.swerving, color: '#2196f3' },
    { name: 'Over Speed', value: events.overSpeed, color: '#4caf50' }
  ];

  return (
    <Box>
      {/* Speed and Score Timeline */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Speed & Score Timeline
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  name="Speed (km/h)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  name="Safety Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Events Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Distribution
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {eventData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Event Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingDownIcon color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Harsh Braking Events"
                    secondary={`${events.harshBraking} incidents detected`}
                  />
                  <Chip 
                    label={events.harshBraking} 
                    color={events.harshBraking > 10 ? "error" : "success"}
                    size="small"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hard Acceleration Events"
                    secondary={`${events.harshAcceleration} incidents detected`}
                  />
                  <Chip 
                    label={events.harshAcceleration} 
                    color={events.harshAcceleration > 10 ? "warning" : "success"}
                    size="small"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CompareArrowsIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Swerving Events"
                    secondary={`${events.swerving} incidents detected`}
                  />
                  <Chip 
                    label={events.swerving} 
                    color={events.swerving > 5 ? "warning" : "success"}
                    size="small"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Over Speed Events"
                    secondary={`${events.overSpeed} incidents detected`}
                  />
                  <Chip 
                    label={events.overSpeed} 
                    color={events.overSpeed > 15 ? "error" : "success"}
                    size="small"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Accident Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                      {accidentDetected ? (
                        <>
                          <CrisisAlertIcon 
                            sx={{ 
                              fontSize: 48, 
                              color: '#f44336', 
                              mb: 1 
                            }} 
                          />
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ color: '#f44336' }}
                          >
                            ACCIDENT
                          </Typography>
                          <Typography variant="caption" color="error">
                            Detected
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon 
                            sx={{ 
                              fontSize: 48, 
                              color: '#4caf50', 
                              mb: 1 
                            }} 
                          />
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ color: '#4caf50' }}
                          >
                            SAFE
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            No accident detected
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Max Speed
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.maxSpeed.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      km/h
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.duration}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      minutes
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Records
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.totalRecords.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      data points
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 