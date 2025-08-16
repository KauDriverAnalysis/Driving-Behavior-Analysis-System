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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
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
  const [isFullscreen, setIsFullscreen] = React.useState(false);
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
            <DirectionsCarIcon sx={{ mr: 1 }} />
            3D Route Simulation
          </Typography>
          <Tooltip title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}>
            <IconButton onClick={toggleFullscreen} color="primary">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
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
                  background: `
                    radial-gradient(ellipse at center, rgba(15, 78, 154, 0.4) 0%, rgba(13, 71, 161, 0.8) 100%),
                    linear-gradient(135deg, #0f1419 0%, #1a2332 25%, #2d3748 50%, #1a2332 75%, #0f1419 100%)
                  `,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)'
                }}
              >
                {/* Enhanced Grid pattern with road effect */}
                <svg 
                  width="100%" 
                  height="100%" 
                  style={{ position: 'absolute', top: 0, left: 0, opacity: 0.4 }}
                >
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4a5568" strokeWidth="0.8"/>
                      <path d="M 20 0 L 20 40" fill="none" stroke="#2d3748" strokeWidth="0.4"/>
                      <path d="M 0 20 L 40 20" fill="none" stroke="#2d3748" strokeWidth="0.4"/>
                    </pattern>
                    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#2d3748" strokeWidth="0.2" opacity="0.5"/>
                    </pattern>
                    <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4a5568" stopOpacity="0.3"/>
                      <stop offset="50%" stopColor="#2d3748" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#1a202c" stopOpacity="0.3"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Fine grid */}
                  <rect width="100%" height="100%" fill="url(#smallGrid)" />
                  {/* Main grid */}
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Road-like paths between major grid lines */}
                  <rect x="0" y="20%" width="100%" height="2" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="0" y="40%" width="100%" height="2" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="0" y="60%" width="100%" height="2" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="0" y="80%" width="100%" height="2" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="20%" y="0" width="2" height="100%" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="40%" y="0" width="2" height="100%" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="60%" y="0" width="2" height="100%" fill="url(#roadGradient)" opacity="0.6"/>
                  <rect x="80%" y="0" width="2" height="100%" fill="url(#roadGradient)" opacity="0.6"/>
                </svg>

                {/* Ambient lighting effects */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%)
                    `,
                    pointerEvents: 'none'
                  }}
                />

                {/* Route Path */}
                <svg 
                  width="100%" 
                  height="100%" 
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="25%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="75%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    
                    {/* Enhanced route gradient with glow */}
                    <linearGradient id="routeGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                    
                    {/* Filter for glow effect */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Draw route path with glow effect */}
                  {data.slice(0, currentIndex + 1).map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = data[index - 1];
                    
                    // Get container dimensions
                    const containerWidth = containerRef.current?.clientWidth || 400;
                    const containerHeight = containerRef.current?.clientHeight || 320;
                    
                    const pos1 = getCarPosition(prevPoint, containerWidth, containerHeight);
                    const pos2 = getCarPosition(point, containerWidth, containerHeight);
                    
                    return (
                      <g key={index}>
                        {/* Glow layer */}
                        <line
                          x1={pos1.x}
                          y1={pos1.y}
                          x2={pos2.x}
                          y2={pos2.y}
                          stroke={point.event ? getEventColor(point.event) : "url(#routeGlowGradient)"}
                          strokeWidth={point.event ? "8" : "6"}
                          opacity={0.4}
                          filter="url(#glow)"
                        />
                        {/* Main path */}
                        <line
                          x1={pos1.x}
                          y1={pos1.y}
                          x2={pos2.x}
                          y2={pos2.y}
                          stroke={point.event ? getEventColor(point.event) : "url(#routeGradient)"}
                          strokeWidth={point.event ? "4" : "3"}
                          opacity={0.9}
                          strokeLinecap="round"
                        />
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
                  color={currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}
                  scale={isFullscreen ? 1.5 : 1.2}
                  hasEvent={!!currentPoint.event}
                  eventColor={currentPoint.event ? getEventColor(currentPoint.event) : undefined}
                />

                {/* Route start and end markers */}
                {data.length > 0 && (
                  <>
                    {/* Start marker */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: (() => {
                          const containerWidth = containerRef.current?.clientWidth || 400;
                          const containerHeight = containerRef.current?.clientHeight || 320;
                          const pos = getCarPosition(data[0], containerWidth, containerHeight);
                          return pos.x - 12;
                        })(),
                        top: (() => {
                          const containerWidth = containerRef.current?.clientWidth || 400;
                          const containerHeight = containerRef.current?.clientHeight || 320;
                          const pos = getCarPosition(data[0], containerWidth, containerHeight);
                          return pos.y - 12;
                        })(),
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #10b981, #34d399)',
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                        zIndex: 10
                      }}
                    >
                      S
                    </Box>

                    {/* End marker */}
                    {data.length > 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: (() => {
                            const containerWidth = containerRef.current?.clientWidth || 400;
                            const containerHeight = containerRef.current?.clientHeight || 320;
                            const pos = getCarPosition(data[data.length - 1], containerWidth, containerHeight);
                            return pos.x - 12;
                          })(),
                          top: (() => {
                            const containerWidth = containerRef.current?.clientWidth || 400;
                            const containerHeight = containerRef.current?.clientHeight || 320;
                            const pos = getCarPosition(data[data.length - 1], containerWidth, containerHeight);
                            return pos.y - 12;
                          })(),
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #ef4444, #f87171)',
                          border: '2px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                          zIndex: 10
                        }}
                      >
                        E
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>

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
        </Typography>
      </CardContent>
    </Card>
  );
}