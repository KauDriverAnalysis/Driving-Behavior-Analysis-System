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
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import MapIcon from '@mui/icons-material/Map';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Car3D } from './3DCar';
import { Environment3D } from './3DEnvironment';
import { Trail3D } from './3DTrail';
import { VehiclePhysics } from './VehiclePhysics';

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
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [followCamera, setFollowCamera] = React.useState(true);
  const [show3DView, setShow3DView] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
  const prevPoint = currentIndex > 0 ? data[currentIndex - 1] : null;
  const progress = ((currentIndex + 1) / data.length) * 100;

  // Calculate dynamic camera position based on movement and events
  const calculateCameraPosition = () => {
    const baseDistance = isFullscreen ? 100 : 80;
    const speedFactor = currentPoint.speed / 100;
    const eventFactor = currentPoint.event ? 1.5 : 1;
    
    return {
      x: followCamera ? Math.sin(getCarRotation(currentIndex) * Math.PI / 180) * 20 : 0,
      y: 30 + speedFactor * 20 + (currentPoint.event ? 10 : 0),
      z: baseDistance + speedFactor * 30 + (currentPoint.event ? 20 : 0)
    };
  };

  // Pre-calculate all positions for trail rendering
  const allPositions = React.useMemo(() => {
    const containerWidth = containerRef.current?.clientWidth || 400;
    const containerHeight = containerRef.current?.clientHeight || 320;
    
    return data.map(point => ({
      ...getCarPosition(point, containerWidth, containerHeight),
      z: 0,
      event: point.event,
      speed: point.speed
    }));
  }, [data, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);

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
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: isFullscreen ? 'white' : 'inherit' }}>
            <MapIcon sx={{ mr: 1 }} />
            {show3DView ? '3D Vehicle Physics Simulation' : '3D Route Simulation'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={show3DView ? "contained" : "outlined"}
              onClick={() => setShow3DView(!show3DView)}
              sx={{ 
                color: isFullscreen && !show3DView ? 'white' : 'inherit',
                borderColor: isFullscreen && !show3DView ? 'white' : 'inherit'
              }}
            >
              {show3DView ? '3D View' : '2D View'}
            </Button>
            <Button
              size="small"
              variant={followCamera ? "contained" : "outlined"}
              onClick={() => setFollowCamera(!followCamera)}
              disabled={!show3DView}
              sx={{ 
                color: isFullscreen && !followCamera ? 'white' : 'inherit',
                borderColor: isFullscreen && !followCamera ? 'white' : 'inherit'
              }}
            >
              {followCamera ? 'Following' : 'Free Cam'}
            </Button>
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
          {show3DView ? (
            // Enhanced 3D Environment
            <Environment3D
              width={containerRef.current?.clientWidth || 400}
              height={containerRef.current?.clientHeight || 320}
              cameraPosition={calculateCameraPosition()}
            >
              {/* 3D Trail System */}
              <Trail3D
                points={allPositions}
                currentIndex={currentIndex}
                containerWidth={containerRef.current?.clientWidth || 400}
                containerHeight={containerRef.current?.clientHeight || 320}
              />
              
              {/* Enhanced Vehicle with Physics */}
              <VehiclePhysics
                currentData={currentPoint}
                prevData={prevPoint}
                position={getCarPosition(currentPoint, containerRef.current?.clientWidth || 400, containerRef.current?.clientHeight || 320)}
              >
                <Car3D
                  position={{ x: 0, y: 0 }} // Position handled by VehiclePhysics
                  rotation={getCarRotation(currentIndex)}
                  color={currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}
                  scale={isFullscreen ? 1.8 : 1.4}
                  hasEvent={!!currentPoint.event}
                  eventColor={currentPoint.event ? getEventColor(currentPoint.event) : undefined}
                  speed={currentPoint.speed}
                  acceleration={{
                    x: prevPoint ? (currentPoint.speed - prevPoint.speed) / 10 : 0,
                    y: 0
                  }}
                  engineRunning={isPlaying}
                />
              </VehiclePhysics>
            </Environment3D>
          ) : (
            // Traditional 2D View
            <div 
              ref={containerRef}
              id="simulation-container"
              style={{ 
                width: '100%', 
                height: '100%', 
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
                  
                  return (
                    <line
                      key={index}
                      x1={pos1.x}
                      y1={pos1.y}
                      x2={pos2.x}
                      y2={pos2.y}
                      stroke={point.event ? getEventColor(point.event) : "url(#routeGradient)"}
                      strokeWidth={point.event ? "3" : "2"}
                      opacity={0.8}
                    />
                  );
                })}
              </svg>

              {/* 2D Car Model */}
              <Car3D
                position={(() => {
                  const containerWidth = containerRef.current?.clientWidth || 400;
                  const containerHeight = containerRef.current?.clientHeight || 320;
                  const pos = getCarPosition(currentPoint, containerWidth, containerHeight);
                  return { x: pos.x - 16, y: pos.y - 8 }; // Center the car
                })()}
              {/* 2D Car Model */}
              <Car3D
                position={(() => {
                  const containerWidth = containerRef.current?.clientWidth || 400;
                  const containerHeight = containerRef.current?.clientHeight || 320;
                  const pos = getCarPosition(currentPoint, containerWidth, containerHeight);
                  return { x: pos.x - 16, y: pos.y - 8 }; // Center the car
                })()}
                rotation={getCarRotation(currentIndex)}
                color={currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}
                scale={isFullscreen ? 1.5 : 1.2}
                hasEvent={!!currentPoint.event}
                eventColor={currentPoint.event ? getEventColor(currentPoint.event) : undefined}
                speed={currentPoint.speed}
                acceleration={{
                  x: prevPoint ? (currentPoint.speed - prevPoint.speed) / 10 : 0,
                  y: 0
                }}
                engineRunning={isPlaying}
              />
            </div>
          )}

          {/* Current stats overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(255,255,255,0.95)',
              p: isFullscreen ? 2 : 1,
              borderRadius: 1,
              minWidth: isFullscreen ? 160 : 120,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
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
            {isFullscreen && (
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                Press F to exit fullscreen
              </Typography>
            )}
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
        </Typography>
      </CardContent>
    </Card>
  );
}