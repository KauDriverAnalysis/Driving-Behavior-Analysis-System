'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import MapIcon from '@mui/icons-material/Map';
import { Car3D } from './3DCar';

// Add the missing Segment interface
interface Segment {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  event?: string;
  score: number;
}

interface Simulation3DProps {
  data: Segment[];
}

export function Simulation3D({ data }: { data: Segment[] }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);

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

  const handlePlay = () => {
    if (currentIndex >= data.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentPoint = data[currentIndex] || data[0];
  const progress = ((currentIndex + 1) / data.length) * 100;

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

  const getEventColor = (event?: string) => {
    switch (event) {
      case 'harsh_braking': return '#f44336';
      case 'harsh_acceleration': return '#ff9800';
      case 'swerving': return '#2196f3';
      case 'over_speed': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <MapIcon sx={{ mr: 1 }} />
          3D Route Simulation
        </Typography>

        {/* 3D Visualization Area */}
        <Box 
          sx={{ 
            height: 400, 
            bgcolor: 'grey.900', 
            borderRadius: 2, 
            position: 'relative',
            mb: 2,
            overflow: 'hidden'
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
              <Typography variant="h6" sx={{ mb: 2 }}>
                3D Vehicle Simulation
              </Typography>
              
              {/* 3D Scene Preview */}
              <Box 
                sx={{ 
                  width: '80%', 
                  height: '80%', 
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
                    const x1 = ((prevPoint.lng - data[0].lng) * 2000 + 50);
                    const y1 = ((prevPoint.lat - data[0].lat) * 2000 + 50);
                    const x2 = ((point.lng - data[0].lng) * 2000 + 50);
                    const y2 = ((point.lat - data[0].lat) * 2000 + 50);
                    
                    return (
                      <line
                        key={index}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={point.event ? getEventColor(point.event) : "url(#routeGradient)"}
                        strokeWidth={point.event ? "3" : "2"}
                        opacity={0.8}
                      />
                    );
                  })}
                </svg>

                {/* 3D Car Model */}
                <Car3D
                  position={{
                    x: ((currentPoint.lng - data[0].lng) * 2000 + 50) * 2 / 100 * 300 - 16, // Convert percentage to pixels and center
                    y: ((currentPoint.lat - data[0].lat) * 2000 + 50) * 2 / 100 * 240 - 8   // Convert percentage to pixels and center
                  }}
                  rotation={getCarRotation(currentIndex)}
                  color={currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}
                  scale={1.2}
                  hasEvent={!!currentPoint.event}
                  eventColor={currentPoint.event ? getEventColor(currentPoint.event) : undefined}
                />
              </Box>
            </Box>

            {/* Current stats overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(255,255,255,0.9)',
                p: 1,
                borderRadius: 1,
                minWidth: 120
              }}
            >
              <Typography variant="caption" display="block">
                Speed: {currentPoint.speed.toFixed(1)} km/h
              </Typography>
              <Typography variant="caption" display="block">
                Score: {currentPoint.score}/100
              </Typography>
              <Typography variant="caption" display="block">
                Time: {currentPoint.time}
              </Typography>
            </Box>

            {/* Event indicator */}
            {currentPoint.event && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16
                }}
              >
                <Chip
                  label={currentPoint.event.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: getEventColor(currentPoint.event),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            )}
          </div>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={handleReset} size="small">
            <ReplayIcon />
          </IconButton>
          <IconButton onClick={handlePlay} color="primary">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Box sx={{ ml: 2 }}>
            <Typography variant="caption" sx={{ mr: 1 }}>Speed:</Typography>
            {[0.5, 1, 2, 4].map(speed => (
              <Button
                key={speed}
                size="small"
                variant={playbackSpeed === speed ? "contained" : "outlined"}
                onClick={() => setPlaybackSpeed(speed)}
                sx={{ minWidth: 40, mr: 0.5 }}
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
              bgcolor: 'grey.300', 
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

        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Progress: {currentIndex + 1} / {data.length} points ({progress.toFixed(1)}%)
        </Typography>
      </CardContent>
    </Card>
  );
}