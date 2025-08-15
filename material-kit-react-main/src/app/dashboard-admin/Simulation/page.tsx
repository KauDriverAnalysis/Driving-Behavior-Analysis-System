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
import { SimulationUpload } from '@/components/dashboard-admin/Simulation/Upload';
import { SimulationResults } from '@/components/dashboard-admin/Simulation/Results';
import { Simulation3D } from '@/components/dashboard-admin/Simulation/3DSimulation';

interface SimulationData {
  summary: {
    totalRecords: number;
    duration: string;
    distance: number;
    avgSpeed: number;
    maxSpeed: number;
    score: number;
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
          {/* Summary Cards */}
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

          {/* Quick Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {simulationData.summary.score}/100
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Safety Score
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

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {Object.values(simulationData.events).reduce((a, b) => a + b, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Events
              </Typography>
            </Paper>
          </Grid>

          {/* Detailed Results */}
          <Grid item xs={12} lg={8}>
            <SimulationResults data={simulationData} />
          </Grid>

          {/* 3D Visualization */}
          <Grid item xs={12} lg={4}>
            <Simulation3D data={simulationData.segments} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}