'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import { SimulationUpload } from '@/components/dashboard-admin/Simulation/Upload';
import { SimulationResults } from '@/components/dashboard-admin/Simulation/Results';
import { Enhanced3DSimulation } from '@/components/dashboard-admin/Simulation/Enhanced3DSimulation';

interface SimulationData {
  summary: {
    totalRecords: number;
    duration: string;
    distance: number;
    avgSpeed: number;
    maxSpeed: number;
    score: number;
    accident_detected?: boolean;
    accident_severity?: string;
  };
  events: {
    harshBraking: number;
    harshAcceleration: number;
    swerving: number;
    overSpeed: number;
  };
  segments: {
    time: string;
    lat: number;
    lng: number;
    speed: number;
    event?: string;
    score: number;
    ax?: number;  // Adding IMU data fields
    ay?: number;
    az?: number;
    gx?: number;
    gy?: number;
    gz?: number;
    yaw?: number;
  }[];
  chartData: {
    time: string;
    speed: number;
    acceleration: number;
    score: number;
  }[];
}

export default function SimulationPage(): React.JSX.Element {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    setCsvFile(file);
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('csv_file', file);

      // Send to backend for analysis
      const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/simulate-driving-data/', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process CSV file');
      }

      const data = await response.json();
      setSimulationData(data);
      
    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setSimulationData(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
          SafeMotion Driving Simulation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload CSV driving data to analyze patterns, simulate behavior, and generate comprehensive reports
        </Typography>
      </Box>

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Processing CSV file...
              </Typography>
              <Typography variant="body2" color="primary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleReset}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {!simulationData ? (
        // Upload Section
        <Card>
          <CardContent sx={{ p: 4 }}>
            <SimulationUpload 
              onFileUpload={handleFileUpload}
              loading={loading}
              acceptedFile={csvFile}
            />
          </CardContent>
        </Card>
      ) : (
        // Results Section
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              Simulation Results
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleReset}
                sx={{ ml: 'auto' }}
              >
                Upload New File
              </Button>
            </Typography>
          </Grid>

          {/* Section 1: Key Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Key Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {simulationData.summary.totalRecords}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {simulationData.summary.duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {simulationData.summary.distance.toFixed(1)} km
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Distance
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {simulationData.summary.avgSpeed.toFixed(0)} km/h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Speed
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Section 2: Data Analysis */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Data Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Speed Over Time
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    {simulationData.chartData && simulationData.chartData.length > 0 ? (
                      <svg width="100%" height="100%" viewBox="0 0 400 200">
                        {simulationData.chartData.map((point, idx, arr) => {
                          if (idx === 0) return null;
                          const prev = arr[idx - 1];
                          const x1 = ((idx - 1) / (arr.length - 1)) * 400;
                          const y1 = 200 - (prev.speed / 200) * 200;
                          const x2 = (idx / (arr.length - 1)) * 400;
                          const y2 = 200 - (point.speed / 200) * 200;
                          return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1976d2" strokeWidth={2} />;
                        })}
                      </svg>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No speed data available.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Event Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Harsh Braking:</Typography>
                      <Chip 
                        label={simulationData.events.harshBraking} 
                        color={simulationData.events.harshBraking > 5 ? "error" : "success"}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Hard Acceleration:</Typography>
                      <Chip 
                        label={simulationData.events.harshAcceleration} 
                        color={simulationData.events.harshAcceleration > 5 ? "warning" : "success"}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Swerving:</Typography>
                      <Chip 
                        label={simulationData.events.swerving} 
                        color={simulationData.events.swerving > 3 ? "warning" : "success"}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Over Speed:</Typography>
                      <Chip 
                        label={simulationData.events.overSpeed} 
                        color={simulationData.events.overSpeed > 10 ? "error" : "success"}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Section 3: Accident Analysis */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Accident Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} lg={8}>
                <SimulationResults data={simulationData} />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Enhanced3DSimulation data={simulationData.segments} />
              </Grid>
            </Grid>
          </Grid>

          {/* Section 4: Actions & Export */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Actions & Export
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded File:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                    {csvFile ? csvFile.name : 'N/A'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={!simulationData}
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(simulationData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'simulation_report.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Report
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleReset}
                    >
                      Upload New File
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TimelineIcon />}
                      onClick={() => {
                        const csvContent = simulationData.chartData.map(row => 
                          `${row.time},${row.speed},${row.acceleration},${row.score}`
                        ).join('\n');
                        const csv = 'Time,Speed,Acceleration,Score\n' + csvContent;
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'chart_data.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Chart Data
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}