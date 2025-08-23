'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  LinearProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import MapIcon from '@mui/icons-material/Map';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import WarningIcon from '@mui/icons-material/Warning';
import CrashIcon from '@mui/icons-material/CarCrash';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import ReportIcon from '@mui/icons-material/Assessment';
import { Car3D } from './3DCar';

// Add the missing Segment interface
interface Segment {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  event?: string;
  score: number;
  // Enhanced accident data
  accidentType?: 'collision' | 'rollover' | 'near_miss' | 'impact';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  accidentScore?: number; // 0-100 scale for accident severity
  damageEstimate?: string;
  emergencyRequired?: boolean;
}

interface Simulation3DProps {
  data: Segment[];
}

export function Simulation3D({ data }: { data: Segment[] }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showAccidentReport, setShowAccidentReport] = React.useState(false);
  const [selectedAccident, setSelectedAccident] = React.useState<Segment | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Calculate accident statistics
  const accidentPoints = React.useMemo(() => {
    return data.filter(point => 
      point.accidentType || 
      point.event === 'harsh_braking' || 
      point.event === 'harsh_acceleration' || 
      point.event === 'swerving'
    );
  }, [data]);

  const criticalAccidents = React.useMemo(() => {
    return accidentPoints.filter(point => 
      point.severity === 'critical' || 
      point.severity === 'high' ||
      point.emergencyRequired
    );
  }, [accidentPoints]);

  React.useEffect(() => {
    if (!isPlaying || currentIndex >= data.length - 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= data.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, data.length, playbackSpeed]);

  const handlePlay = React.useCallback(() => {
    if (currentIndex >= data.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  }, [currentIndex, data.length, isPlaying]);

  const handleReset = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Add keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen();
      } else if (event.key === ' ') {
        event.preventDefault();
        handlePlay();
      } else if (event.key === 'r' || event.key === 'R') {
        handleReset();
      } else if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, handlePlay, handleReset, toggleFullscreen]);

  const currentPoint = data[currentIndex] || data[0];
  const progress = ((currentIndex + 1) / data.length) * 100;

  // Calculate car position based on GPS bounds
  const getCarPosition = (point: Segment, containerWidth: number, containerHeight: number) => {
    if (!data.length) return { x: 0, y: 0 };
    
    // Find min/max bounds of the entire route
    const lats = data.map(d => d.lat);
    const lngs = data.map(d => d.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Normalize position within bounds (0-1)
    const normalizedX = maxLng !== minLng ? (point.lng - minLng) / (maxLng - minLng) : 0.5;
    const normalizedY = maxLat !== minLat ? (point.lat - minLat) / (maxLat - minLat) : 0.5;
    
    // Convert to container coordinates with padding
    const padding = 50;
    const x = padding + normalizedX * (containerWidth - 2 * padding);
    const y = padding + (1 - normalizedY) * (containerHeight - 2 * padding); // Invert Y for screen coordinates
    
    return { x, y };
  };

  // Calculate car rotation based on movement direction
  const getCarRotation = (currentIdx: number) => {
    if (currentIdx === 0 || currentIdx >= data.length - 1) return 0;
    
    const current = data[currentIdx];
    const next = data[currentIdx + 1];
    
    const deltaLng = next.lng - current.lng;
    const deltaLat = next.lat - current.lat;
    
    // Calculate angle in degrees (0 = north, 90 = east, etc.)
    const angle = Math.atan2(deltaLng, deltaLat) * 180 / Math.PI;
    return angle;
  };

  const getEventColor = (event?: string, accidentType?: string, severity?: string) => {
    if (accidentType) {
      switch (accidentType) {
        case 'collision': return '#d32f2f'; // Dark red
        case 'rollover': return '#ff5722'; // Deep orange
        case 'near_miss': return '#ff9800'; // Orange
        case 'impact': return '#b71c1c'; // Very dark red
        default: return '#f44336';
      }
    }
    
    if (severity) {
      switch (severity) {
        case 'critical': return '#b71c1c';
        case 'high': return '#d32f2f';
        case 'medium': return '#f57c00';
        case 'low': return '#ffc107';
        default: return '#ff5722';
      }
    }

    switch (event) {
      case 'harsh_braking': return '#f44336';
      case 'harsh_acceleration': return '#ff9800';
      case 'swerving': return '#2196f3';
      case 'over_speed': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getAccidentIcon = (accidentType?: string, severity?: string) => {
    if (accidentType === 'collision' || accidentType === 'impact') {
      return <CrashIcon sx={{ fontSize: 16 }} />;
    }
    if (severity === 'critical' || severity === 'high') {
      return <EmergencyIcon sx={{ fontSize: 16 }} />;
    }
    return <WarningIcon sx={{ fontSize: 16 }} />;
  };

  const handleAccidentClick = (point: Segment) => {
    if (point.accidentType || point.severity) {
      setSelectedAccident(point);
      setShowAccidentReport(true);
    }
  };

  return (
    <Card sx={{ 
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      width: isFullscreen ? '100vw' : 'auto',
      height: isFullscreen ? '100vh' : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
      backgroundColor: isFullscreen ? 'grey.900' : 'inherit'
    }}>
      <CardContent sx={{ height: isFullscreen ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: isFullscreen ? 'white' : 'inherit' }}>
              <MapIcon sx={{ mr: 1 }} />
              Accident Analysis & 3D Simulation
            </Typography>
            
            {/* Accident Statistics */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Badge badgeContent={criticalAccidents.length} color="error">
                <Chip
                  icon={<CrashIcon />}
                  label={`${accidentPoints.length} Incidents`}
                  color={criticalAccidents.length > 0 ? "error" : "warning"}
                  size="small"
                  onClick={() => {
                    if (accidentPoints.length > 0) {
                      const firstAccident = accidentPoints[0];
                      const accidentIndex = data.findIndex(p => p === firstAccident);
                      setCurrentIndex(accidentIndex);
                      setSelectedAccident(firstAccident);
                      setShowAccidentReport(true);
                    }
                  }}
                  sx={{ cursor: accidentPoints.length > 0 ? 'pointer' : 'default' }}
                />
              </Badge>
              
              {criticalAccidents.length > 0 && (
                <Chip
                  icon={<EmergencyIcon />}
                  label={`${criticalAccidents.length} Critical`}
                  color="error"
                  size="small"
                  sx={{ 
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Generate Accident Report">
              <IconButton 
                onClick={() => setShowAccidentReport(true)} 
                color="primary"
                disabled={accidentPoints.length === 0}
              >
                <ReportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}>
              <IconButton onClick={toggleFullscreen} color="primary">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 3D Visualization Area */}
        <Box 
          sx={{ 
            height: isFullscreen ? 'calc(100vh - 200px)' : 400, 
            bgcolor: 'grey.900', 
            borderRadius: 2, 
            position: 'relative',
            mb: 2,
            overflow: 'hidden',
            flex: isFullscreen ? 1 : 'none'
          }}
        >
          {/* 3D Canvas will be rendered here */}
          <div 
            id="three-canvas-container"
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'relative'
            }}
          >
            {/* Fallback for when Three.js is not available */}
            <Box 
              sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'white',
                textAlign: 'center'
              }}
            >
              {!isFullscreen && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  3D Vehicle Simulation
                </Typography>
              )}
              
              {/* 3D Scene Preview */}
              <Box 
                ref={containerRef}
                id="simulation-container"
                sx={{ 
                  width: isFullscreen ? '100%' : '80%', 
                  height: isFullscreen ? '100%' : '80%', 
                  border: '1px solid #444',
                  borderRadius: 1,
                  position: 'relative',
                  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                  overflow: 'hidden'
                }}
              >
                {/* Grid pattern */}
                <svg 
                  width="100%" 
                  height="100%" 
                  style={{ position: 'absolute', top: 0, left: 0, opacity: 0.3 }}
                >
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#444" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Route Path */}
                <svg 
                  width="100%" 
                  height="100%" 
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2196f3" />
                      <stop offset="100%" stopColor="#4caf50" />
                    </linearGradient>
                  </defs>
                  
                  {/* Draw route path */}
                  {data.slice(0, currentIndex + 1).map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = data[index - 1];
                    
                    // Get container dimensions
                    const containerWidth = containerRef.current?.clientWidth || 400;
                    const containerHeight = containerRef.current?.clientHeight || 320;
                    
                    const pos1 = getCarPosition(prevPoint, containerWidth, containerHeight);
                    const pos2 = getCarPosition(point, containerWidth, containerHeight);
                    
                    const strokeColor = getEventColor(point.event, point.accidentType, point.severity);
                    const strokeWidth = point.accidentType ? 5 : (point.event ? 3 : 2);
                    
                    return (
                      <line
                        key={index}
                        x1={pos1.x}
                        y1={pos1.y}
                        x2={pos2.x}
                        y2={pos2.y}
                        stroke={point.event || point.accidentType ? strokeColor : "url(#routeGradient)"}
                        strokeWidth={strokeWidth}
                        opacity={point.accidentType ? 1 : 0.8}
                        strokeDasharray={point.accidentType ? "5,5" : "none"}
                      />
                    );
                  })}
                  
                  {/* Accident markers */}
                  {accidentPoints.map((accident, index) => {
                    const accidentIndex = data.findIndex(p => p === accident);
                    if (accidentIndex > currentIndex) return null;
                    
                    const containerWidth = containerRef.current?.clientWidth || 400;
                    const containerHeight = containerRef.current?.clientHeight || 320;
                    const pos = getCarPosition(accident, containerWidth, containerHeight);
                    
                    return (
                      <g key={`accident-${index}`}>
                        {/* Pulsing circle for accidents */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="12"
                          fill={getEventColor(accident.event, accident.accidentType, accident.severity)}
                          opacity="0.8"
                          style={{
                            cursor: 'pointer',
                            animation: 'pulse 1.5s infinite'
                          }}
                          onClick={() => handleAccidentClick(accident)}
                        >
                          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                        </circle>
                        
                        {/* Warning icon */}
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          style={{ cursor: 'pointer', pointerEvents: 'none' }}
                        >
                          ⚠
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* 3D Car Model */}
                <Car3D
                  position={(() => {
                    const containerWidth = containerRef.current?.clientWidth || 400;
                    const containerHeight = containerRef.current?.clientHeight || 320;
                    const pos = getCarPosition(currentPoint, containerWidth, containerHeight);
                    return { x: pos.x - 16, y: pos.y - 8 }; // Center the car
                  })()}
                  rotation={getCarRotation(currentIndex)}
                  color={currentPoint.accidentType ? 
                    getEventColor(currentPoint.event, currentPoint.accidentType, currentPoint.severity) : 
                    (currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b')
                  }
                  scale={isFullscreen ? 1.5 : 1.2}
                  hasEvent={!!(currentPoint.event || currentPoint.accidentType)}
                  eventColor={currentPoint.accidentType ? 
                    getEventColor(currentPoint.event, currentPoint.accidentType, currentPoint.severity) : 
                    (currentPoint.event ? getEventColor(currentPoint.event) : undefined)
                  }
                />
                
                {/* Accident impact effect */}
                {currentPoint.accidentType && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: (() => {
                        const containerWidth = containerRef.current?.clientWidth || 400;
                        const containerHeight = containerRef.current?.clientHeight || 320;
                        const pos = getCarPosition(currentPoint, containerWidth, containerHeight);
                        return pos.x - 30;
                      })(),
                      top: (() => {
                        const containerWidth = containerRef.current?.clientWidth || 400;
                        const containerHeight = containerRef.current?.clientHeight || 320;
                        const pos = getCarPosition(currentPoint, containerWidth, containerHeight);
                        return pos.y - 30;
                      })(),
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      border: '3px solid #f44336',
                      animation: 'impactWave 1s infinite',
                      '@keyframes impactWave': {
                        '0%': { 
                          transform: 'scale(0.5)', 
                          opacity: 1,
                          borderColor: '#f44336'
                        },
                        '50%': { 
                          transform: 'scale(1)', 
                          opacity: 0.7,
                          borderColor: '#ff9800'
                        },
                        '100%': { 
                          transform: 'scale(1.5)', 
                          opacity: 0,
                          borderColor: '#ffeb3b'
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Current stats overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: currentPoint.accidentType ? 'rgba(244, 67, 54, 0.95)' : 'rgba(255,255,255,0.95)',
                color: currentPoint.accidentType ? 'white' : 'inherit',
                p: isFullscreen ? 2 : 1,
                borderRadius: 1,
                minWidth: isFullscreen ? 200 : 140,
                backdropFilter: 'blur(10px)',
                border: currentPoint.accidentType ? '2px solid #f44336' : '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <Typography variant={isFullscreen ? "body2" : "caption"} display="block" fontWeight="bold">
                Speed: {currentPoint.speed.toFixed(1)} km/h
              </Typography>
              <Typography variant={isFullscreen ? "body2" : "caption"} display="block">
                Score: {currentPoint.score}/100
              </Typography>
              <Typography variant={isFullscreen ? "body2" : "caption"} display="block">
                Time: {currentPoint.time}
              </Typography>
              
              {/* Accident Information */}
              {currentPoint.accidentType && (
                <>
                  <Typography variant={isFullscreen ? "body2" : "caption"} display="block" fontWeight="bold" sx={{ mt: 1, color: currentPoint.accidentType ? 'white' : '#f44336' }}>
                    🚨 ACCIDENT DETECTED
                  </Typography>
                  <Typography variant={isFullscreen ? "body2" : "caption"} display="block">
                    Type: {currentPoint.accidentType?.toUpperCase()}
                  </Typography>
                  {currentPoint.severity && (
                    <Typography variant={isFullscreen ? "body2" : "caption"} display="block">
                      Severity: {currentPoint.severity?.toUpperCase()}
                    </Typography>
                  )}
                  {currentPoint.accidentScore && (
                    <Typography variant={isFullscreen ? "body2" : "caption"} display="block">
                      Impact Score: {currentPoint.accidentScore}/100
                    </Typography>
                  )}
                  {currentPoint.emergencyRequired && (
                    <Typography variant={isFullscreen ? "body2" : "caption"} display="block" sx={{ fontWeight: 'bold', color: '#ffeb3b' }}>
                      🚑 EMERGENCY REQUIRED
                    </Typography>
                  )}
                </>
              )}
              
              {isFullscreen && (
                <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                  Press F to exit fullscreen
                </Typography>
              )}
            </Box>

            {/* Event and Accident indicators */}
            {(currentPoint.event || currentPoint.accidentType) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  alignItems: 'flex-end'
                }}
              >
                {currentPoint.accidentType && (
                  <Chip
                    icon={getAccidentIcon(currentPoint.accidentType, currentPoint.severity)}
                    label={`${currentPoint.accidentType.replace('_', ' ').toUpperCase()} ACCIDENT`}
                    size={isFullscreen ? "medium" : "small"}
                    sx={{
                      bgcolor: getEventColor(currentPoint.event, currentPoint.accidentType, currentPoint.severity),
                      color: 'white',
                      fontWeight: 'bold',
                      animation: 'blink 1s infinite',
                      '@keyframes blink': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 }
                      }
                    }}
                    onClick={() => handleAccidentClick(currentPoint)}
                  />
                )}
                
                {currentPoint.event && !currentPoint.accidentType && (
                  <Chip
                    label={currentPoint.event.replace('_', ' ').toUpperCase()}
                    size={isFullscreen ? "medium" : "small"}
                    sx={{
                      bgcolor: getEventColor(currentPoint.event),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                )}
                
                {currentPoint.emergencyRequired && (
                  <Chip
                    icon={<EmergencyIcon />}
                    label="EMERGENCY"
                    size="small"
                    sx={{
                      bgcolor: '#b71c1c',
                      color: '#ffeb3b',
                      fontWeight: 'bold',
                      animation: 'emergency 0.5s infinite',
                      '@keyframes emergency': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }}
                  />
                )}
              </Box>
            )}
          </div>
        </Box>

        {/* Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 1, 
          mb: 2,
          flexWrap: 'wrap',
          bgcolor: isFullscreen ? 'rgba(0,0,0,0.8)' : 'transparent',
          p: isFullscreen ? 1 : 0,
          borderRadius: isFullscreen ? 1 : 0
        }}>
          <IconButton onClick={handleReset} size="small" sx={{ color: isFullscreen ? 'white' : 'inherit' }}>
            <ReplayIcon />
          </IconButton>
          <IconButton onClick={handlePlay} color="primary">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Box sx={{ ml: 2 }}>
            <Typography variant="caption" sx={{ mr: 1, color: isFullscreen ? 'white' : 'inherit' }}>Speed:</Typography>
            {[0.5, 1, 2, 4].map(speed => (
              <Button
                key={speed}
                size="small"
                variant={playbackSpeed === speed ? "contained" : "outlined"}
                onClick={() => setPlaybackSpeed(speed)}
                sx={{ 
                  minWidth: 40, 
                  mr: 0.5,
                  color: isFullscreen && playbackSpeed !== speed ? 'white' : 'inherit',
                  borderColor: isFullscreen && playbackSpeed !== speed ? 'white' : 'inherit'
                }}
              >
                {speed}x
              </Button>
            ))}
          </Box>
        </Box>

        {/* Progress bar */}
        <Box sx={{ width: '100%', mb: 1 }}>
          <Box 
            sx={{ 
              height: 4, 
              bgcolor: isFullscreen ? 'rgba(255,255,255,0.3)' : 'grey.300', 
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                bgcolor: 'primary.main',
                borderRadius: 2,
                transition: 'width 0.1s ease-in-out'
              }}
            />
          </Box>
        </Box>

        <Typography 
          variant="caption" 
          color={isFullscreen ? "white" : "text.secondary"} 
          align="center" 
          display="block"
        >
          Progress: {currentIndex + 1} / {data.length} points ({progress.toFixed(1)}%)
          {accidentPoints.length > 0 && (
            <> • {accidentPoints.length} accidents detected</>
          )}
        </Typography>
        
        {/* Accident Summary Alert */}
        {criticalAccidents.length > 0 && !isFullscreen && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setShowAccidentReport(true)}
              >
                VIEW REPORT
              </Button>
            }
          >
            {criticalAccidents.length} critical accident{criticalAccidents.length > 1 ? 's' : ''} detected requiring immediate attention!
          </Alert>
        )}
      </CardContent>

      {/* Accident Report Dialog */}
      <Dialog 
        open={showAccidentReport} 
        onClose={() => setShowAccidentReport(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CrashIcon />
          Accident Analysis Report
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAccident ? (
            // Individual accident details
            <Box>
              <Typography variant="h6" gutterBottom color="error">
                🚨 Accident Details
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Time:</Typography>
                  <Typography>{selectedAccident.time}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Speed:</Typography>
                  <Typography>{selectedAccident.speed.toFixed(1)} km/h</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Accident Type:</Typography>
                  <Typography color="error" fontWeight="bold">
                    {selectedAccident.accidentType?.toUpperCase() || 'DRIVING INCIDENT'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Severity:</Typography>
                  <Typography 
                    color={selectedAccident.severity === 'critical' ? 'error' : 
                           selectedAccident.severity === 'high' ? 'warning' : 'info'}
                    fontWeight="bold"
                  >
                    {selectedAccident.severity?.toUpperCase() || 'MEDIUM'}
                  </Typography>
                </Box>
                {selectedAccident.accidentScore && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">Impact Score:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedAccident.accidentScore} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={selectedAccident.accidentScore > 80 ? 'error' : 
                               selectedAccident.accidentScore > 50 ? 'warning' : 'success'}
                      />
                      <Typography fontWeight="bold">
                        {selectedAccident.accidentScore}/100
                      </Typography>
                    </Box>
                  </Box>
                )}
                {selectedAccident.damageEstimate && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">Damage Estimate:</Typography>
                    <Typography>{selectedAccident.damageEstimate}</Typography>
                  </Box>
                )}
              </Box>

              {selectedAccident.emergencyRequired && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography fontWeight="bold">🚑 EMERGENCY RESPONSE REQUIRED</Typography>
                  <Typography>This accident requires immediate medical attention and emergency services.</Typography>
                </Alert>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                📊 Recommendations
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Immediate driver assessment and potential suspension</li>
                <li>Vehicle inspection for mechanical issues</li>
                <li>Route safety analysis</li>
                {selectedAccident.emergencyRequired && <li><strong>Contact emergency services immediately</strong></li>}
                <li>Insurance claim documentation</li>
                <li>Driver retraining program enrollment</li>
              </Box>
            </Box>
          ) : (
            // Overall accident summary
            <Box>
              <Typography variant="h6" gutterBottom>
                📈 Accident Summary
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
                <Card sx={{ p: 2, bgcolor: '#ffebee' }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {accidentPoints.length}
                  </Typography>
                  <Typography variant="body2">Total Incidents</Typography>
                </Card>
                <Card sx={{ p: 2, bgcolor: '#ffcdd2' }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {criticalAccidents.length}
                  </Typography>
                  <Typography variant="body2">Critical Events</Typography>
                </Card>
                <Card sx={{ p: 2, bgcolor: '#f3e5f5' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {accidentPoints.filter(a => a.emergencyRequired).length}
                  </Typography>
                  <Typography variant="body2">Emergency Cases</Typography>
                </Card>
              </Box>

              <Typography variant="h6" gutterBottom>
                🔍 Incident Breakdown
              </Typography>
              
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {accidentPoints.map((accident, index) => {
                  const accidentIndex = data.findIndex(p => p === accident);
                  return (
                    <Card 
                      key={index} 
                      sx={{ 
                        p: 2, 
                        mb: 1, 
                        cursor: 'pointer',
                        border: accident.severity === 'critical' ? '2px solid #f44336' : '1px solid #ddd'
                      }}
                      onClick={() => {
                        setSelectedAccident(accident);
                        setCurrentIndex(accidentIndex);
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {accident.accidentType?.toUpperCase() || accident.event?.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Time: {accident.time} | Speed: {accident.speed.toFixed(1)} km/h
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip 
                            size="small"
                            label={accident.severity?.toUpperCase() || 'MEDIUM'}
                            color={accident.severity === 'critical' ? 'error' : 
                                   accident.severity === 'high' ? 'warning' : 'default'}
                          />
                          {accident.emergencyRequired && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip size="small" label="EMERGENCY" color="error" />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAccident(null)} disabled={!selectedAccident}>
            Back to Summary
          </Button>
          <Button onClick={() => setShowAccidentReport(false)}>
            Close
          </Button>
          <Button variant="contained" color="primary">
            Export Report
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}