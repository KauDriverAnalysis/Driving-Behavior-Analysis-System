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
import DownloadIcon from '@mui/icons-material/Download';
import { SimulationUpload } from '@/components/dashboard-customer/Simulation/Upload';
import { SimulationResults } from '@/components/dashboard-customer/Simulation/Results';
import { Enhanced3DSimulation } from '@/components/dashboard-customer/Simulation/Enhanced3DSimulation';

interface SimulationData {
  summary: {
    totalRecords: number;
    duration: string;
    distance: number;
    avgSpeed: number;
    maxSpeed: number;
    score: number;
    accident_detected?: boolean;
    accident_risk?: string;
    accident_confidence?: number;
    accident_type?: string;
    accident_severity?: string;
    accident_timestamp?: string;
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

  const generatePersonalReport = () => {
    if (!simulationData) return;

    const { summary, segments } = simulationData;
    
    // Calculate additional metrics for the report
    const accidentDetected = summary.accident_detected || false;
    const riskLevel = summary.accident_risk || 'LOW';
    const confidence = summary.accident_confidence || 85;
    
    // Analyze speed patterns
    const speedViolations = segments.filter(s => s.speed > 120).length;
    const averageSpeed = segments.reduce((sum, s) => sum + s.speed, 0) / segments.length;
    
    // Analyze G-force data
    const highGForceEvents = segments.filter(s => 
      Math.sqrt((s.ax || 0) ** 2 + (s.ay || 0) ** 2 + (s.az || 0) ** 2) > 2
    ).length;
    
    // Find critical moments
    const criticalMoments = segments.filter((s, i) => {
      if (i === 0) return false;
      const prevSegment = segments[i - 1];
      const suddenStop = s.speed < 10 && prevSegment.speed > 50;
      const highDeceleration = (s.ax || 0) < -8;
      return suddenStop || highDeceleration;
    });

    // Generate personal driving report
    const reportContent = `
MY PERSONAL DRIVING REPORT
==========================

TRIP SUMMARY
------------
Report Generated: ${new Date().toLocaleString()}
My Trip File: ${csvFile?.name || 'My Driving Data'}
Trip Status: ${accidentDetected ? '⚠️ INCIDENT DETECTED' : '✅ SAFE TRIP'}
My Risk Level: ${riskLevel}
Analysis Confidence: ${confidence}%

MY JOURNEY DETAILS
------------------
Distance I Traveled: ${summary.distance.toFixed(2)} km
Trip Duration: ${summary.duration} minutes
Data Points Recorded: ${summary.totalRecords.toLocaleString()}
My Average Speed: ${averageSpeed.toFixed(1)} km/h
My Top Speed: ${summary.maxSpeed.toFixed(1)} km/h

SAFETY ASSESSMENT
-----------------
Incident Detection: ${accidentDetected ? '⚠️ NEEDS ATTENTION' : '✅ SAFE DRIVING'}
${accidentDetected ? `Incident Type: ${summary.accident_type || 'Possible Impact'}` : ''}
${accidentDetected ? `Severity Level: ${summary.accident_severity || 'Moderate'}` : ''}
${accidentDetected ? `Time of Incident: ${summary.accident_timestamp || 'Check trip timeline'}` : ''}

MY DRIVING PATTERNS
-------------------
Times I Exceeded Speed Limits: ${speedViolations} occasions
High Impact Events: ${highGForceEvents} occurrences
Sudden Stops I Made: ${criticalMoments.length} instances
Overall Risk Assessment: ${riskLevel}

MY DRIVING PERFORMANCE
----------------------
${accidentDetected ? 
`⚠️ INCIDENT DETECTED: Your driving data shows patterns that may indicate an incident occurred during your trip.
   Please review what happened and consider contacting appropriate authorities if needed.
   Key concerns: sudden speed changes, high impact forces, or unexpected movements.` :
`✅ GREAT DRIVING: Your trip shows safe driving patterns with good risk management.
   Keep up the excellent work maintaining safe speeds and smooth driving habits!`}

MY SPEED PERFORMANCE
--------------------
- Slowest Speed: ${Math.min(...segments.map(s => s.speed)).toFixed(1)} km/h
- Fastest Speed: ${summary.maxSpeed.toFixed(1)} km/h
- Average Speed: ${averageSpeed.toFixed(1)} km/h
- Speed Limit Violations: ${speedViolations} times

MY MOVEMENT ANALYSIS
--------------------
${segments.length > 0 ? `
- Strongest Side Movement: ${Math.max(...segments.map(s => Math.abs(s.ay || 0))).toFixed(2)}g
- Strongest Braking/Acceleration: ${Math.max(...segments.map(s => Math.abs(s.ax || 0))).toFixed(2)}g
- Strongest Vertical Force: ${Math.max(...segments.map(s => Math.abs(s.az || 0))).toFixed(2)}g
- High Impact Moments: ${highGForceEvents}` : 'Movement data not available for this trip'}

NOTABLE MOMENTS IN MY TRIP
---------------------------
${criticalMoments.length > 0 ? 
criticalMoments.slice(0, 3).map((moment, i) => 
`${i + 1}. At ${moment.time}: Speed dropped to ${moment.speed.toFixed(1)} km/h with ${Math.sqrt((moment.ax || 0) ** 2 + (moment.ay || 0) ** 2).toFixed(2)}g force`
).join('\n') : 'No critical moments detected - excellent smooth driving!'}

PERSONALIZED RECOMMENDATIONS
-----------------------------
${accidentDetected ? 
`⚠️ IMMEDIATE STEPS TO TAKE:
- Review what happened during this trip
- Check if you or your vehicle need any attention
- Contact emergency services if there was an actual incident
- Consider reviewing your driving patterns
- Think about taking a defensive driving refresher course` :
`✅ KEEP UP THE EXCELLENT WORK:
- Continue your safe driving practices
- Maintain awareness of speed limits
- Keep your vehicle well-maintained
- Stay focused and alert while driving
- Consider advanced driving courses to enhance your skills further`}

MY DRIVING STATISTICS
---------------------
Data Recording Rate: ${(summary.totalRecords / (parseFloat(summary.duration) * 60)).toFixed(1)} readings per second
Trip Analysis: Personal SafeMotion AI
My Safety Score: ${summary.score || 'Processing...'}/100
Report Quality: High-Resolution Analysis

PERSONAL NOTE
-------------
This is your personal driving analysis report created just for you. Use this information to:
- Better understand your driving habits
- Identify opportunities for improvement
- Track your progress over time
- Share with your insurance for potential safe driver benefits

Remember: Safe driving protects you, your loved ones, and everyone on the road.

Personal Report ID: SM-PERSONAL-${Date.now()}
Created by: SafeMotion Personal Analysis System
Your privacy is important - this data stays with you.
    `.trim();

    return reportContent;
  };

  const handleDownloadReport = () => {
    if (!simulationData) return;

    try {
      const reportContent = generatePersonalReport();
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const status = simulationData.summary.accident_detected ? 'INCIDENT' : 'SAFE';
      const fileName = `My_Driving_Report_${status}_${timestamp}.txt`;
      
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Personal driving report downloaded:', fileName);
    } catch (error) {
      console.error('Error downloading your report:', error);
      setError('Failed to download your personal report. Please try again.');
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
          My Driving Simulation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload your driving data to analyze patterns, view simulation, and track your driving performance
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
              Your Driving Results
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleDownloadReport}
                  startIcon={<DownloadIcon />}
                  sx={{ 
                    bgcolor: simulationData.summary.accident_detected ? 'error.main' : 'success.main',
                    '&:hover': {
                      bgcolor: simulationData.summary.accident_detected ? 'error.dark' : 'success.dark'
                    }
                  }}
                >
                  Download My Report
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleReset}
                >
                  Upload New File
                </Button>
              </Box>
            </Typography>
          </Grid>

          {/* Incident Detection Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: simulationData.summary.accident_detected ? 'error.50' : 'success.50' }}>
              <Typography variant="h4" color={simulationData.summary.accident_detected ? 'error.main' : 'success.main'} fontWeight="bold">
                {simulationData.summary.accident_detected ? 'INCIDENT' : 'SAFE'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                My Trip Status
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {simulationData.summary.distance.toFixed(1)} km
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Distance I Traveled
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {simulationData.summary.maxSpeed.toFixed(0)} km/h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                My Top Speed
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {simulationData.summary.accident_risk || 'LOW'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                My Risk Level
              </Typography>
            </Paper>
          </Grid>

          {/* Detailed Results */}
          <Grid item xs={12} lg={8}>
            <SimulationResults data={simulationData} />
          </Grid>

          {/* Enhanced 3D Visualization */}
          <Grid item xs={12} lg={4}>
            <Enhanced3DSimulation data={simulationData.segments} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
