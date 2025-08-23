'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  LinearProgress
} from '@mui/material';
import CrashIcon from '@mui/icons-material/CarCrash';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Simulation3D } from './3DSimulation';
import sampleAccidentData, { accidentStatistics } from './sampleAccidentData';

export function AccidentAnalysisDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('all');

  const filteredData = React.useMemo(() => {
    if (selectedTimeRange === 'accidents_only') {
      return sampleAccidentData.filter(point => 
        point.accidentType || 
        point.event === 'harsh_braking' || 
        point.event === 'harsh_acceleration' || 
        point.event === 'swerving'
      );
    }
    return sampleAccidentData;
  }, [selectedTimeRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#689f38';
      default: return '#757575';
    }
  };

  const getAccidentTypeIcon = (type: string) => {
    switch (type) {
      case 'collision':
      case 'impact':
        return <CrashIcon />;
      case 'rollover':
        return <DirectionsCarIcon sx={{ transform: 'rotate(90deg)' }} />;
      case 'near_miss':
        return <WarningIcon />;
      default:
        return <SpeedIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CrashIcon sx={{ fontSize: '2rem', color: 'error.main' }} />
          Vehicle Accident Analysis & Safety Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Real-time monitoring and analysis of vehicle accidents with emergency response integration
        </Typography>
      </Box>

      {/* Critical Alerts */}
      {accidentStatistics.severityBreakdown.critical > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<EmergencyIcon />}>
              CONTACT EMERGENCY
            </Button>
          }
        >
          <Typography fontWeight="bold">
            🚨 CRITICAL ACCIDENTS DETECTED: {accidentStatistics.severityBreakdown.critical} incidents require immediate emergency response!
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Overview */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 'fit-content', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon />
                Accident Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                    <Typography variant="h3" color="error" fontWeight="bold">
                      {accidentStatistics.totalIncidents}
                    </Typography>
                    <Typography variant="body2">Total Incidents</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffcdd2' }}>
                    <Typography variant="h3" color="error" fontWeight="bold">
                      {accidentStatistics.criticalAccidents}
                    </Typography>
                    <Typography variant="body2">Critical Events</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                    <Typography variant="h3" color="success" fontWeight="bold">
                      {accidentStatistics.emergencyRequired}
                    </Typography>
                    <Typography variant="body2">Emergency Cases</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                    <Typography variant="h3" color="primary" fontWeight="bold">
                      {Math.round((accidentStatistics.criticalAccidents / accidentStatistics.totalIncidents) * 100)}%
                    </Typography>
                    <Typography variant="body2">Severity Rate</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Severity Distribution
              </Typography>
              {Object.entries(accidentStatistics.severityBreakdown).map(([severity, count]) => (
                count > 0 && (
                  <Box key={severity} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {severity}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / accidentStatistics.totalIncidents) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getSeverityColor(severity),
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                )
              ))}
            </CardContent>
          </Card>

          {/* Accident Types */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Incident Types Detected
              </Typography>
              <List dense>
                {Object.entries(accidentStatistics.accidentTypes).map(([type, count]) => (
                  count > 0 && (
                    <ListItem key={type} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getAccidentTypeIcon(type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={type.replace('_', ' ').toUpperCase()}
                        secondary={`${count} incident${count > 1 ? 's' : ''}`}
                      />
                      <Chip 
                        label={count} 
                        size="small" 
                        color={count >= 3 ? 'error' : count >= 2 ? 'warning' : 'default'}
                      />
                    </ListItem>
                  )
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 3D Simulation */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant={selectedTimeRange === 'all' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTimeRange('all')}
              size="small"
            >
              All Data
            </Button>
            <Button
              variant={selectedTimeRange === 'accidents_only' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTimeRange('accidents_only')}
              size="small"
              color="error"
            >
              Accidents Only
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Showing {filteredData.length} data points
            </Typography>
          </Box>
          
          <Simulation3D data={filteredData} />
          
          {/* Instructions */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Simulation Controls:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Click ▶️ to start/pause the simulation<br/>
              • Use speed controls (0.5x - 4x) to adjust playback<br/>
              • Press F for fullscreen mode<br/>
              • Click on accident markers (⚠) for detailed reports<br/>
              • Red pulsing circles indicate critical accidents<br/>
              • Orange markers show near-miss incidents
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Emergency Response Section */}
      {accidentStatistics.emergencyRequired > 0 && (
        <Card sx={{ mt: 3, border: '2px solid #f44336' }}>
          <CardContent sx={{ bgcolor: '#ffebee' }}>
            <Typography variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmergencyIcon />
              Emergency Response Required
            </Typography>
            <Typography variant="body1" gutterBottom>
              {accidentStatistics.emergencyRequired} accident{accidentStatistics.emergencyRequired > 1 ? 's' : ''} detected that require immediate emergency services.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" color="error" startIcon={<EmergencyIcon />}>
                Contact 911
              </Button>
              <Button variant="outlined" color="error">
                Notify Fleet Manager
              </Button>
              <Button variant="outlined" color="error">
                Generate Incident Report
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Safety Recommendations */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🛡️ Safety Recommendations Based on Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="error">
                Immediate Actions Required:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Deploy emergency services to accident locations" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Suspend drivers involved in critical incidents" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Inspect vehicles for mechanical failures" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Document incidents for insurance claims" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="warning.main">
                Preventive Measures:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Implement mandatory driver safety training" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Install advanced driver assistance systems (ADAS)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Increase monitoring frequency for high-risk routes" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Review and update fleet safety policies" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}

export default AccidentAnalysisDashboard;
