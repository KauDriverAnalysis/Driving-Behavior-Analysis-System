'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SimpleOrbitControls } from './SimpleOrbitControls';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
  Stack,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import MapIcon from '@mui/icons-material/Map';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { Enhanced3DVehicle } from './Enhanced3DVehicle';

interface VehicleData {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  event?: string;
  score: number;
  ax?: number;
  ay?: number;
  az?: number;
  gx?: number;
  gy?: number;
  gz?: number;
  yaw?: number;
}

interface Enhanced3DSimulationProps {
  data: VehicleData[];
}

function Scene({ data, currentIndex, followCamera, showTrail }: {
  data: VehicleData[];
  currentIndex: number;
  followCamera: boolean;
  showTrail: boolean;
}) {
  return (
    <Suspense fallback={null}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.3} />
      <hemisphereLight args={['#ffffff', '#444444']} intensity={0.6} />
      
      {/* Main vehicle component */}
      <Enhanced3DVehicle
        allData={data}
        currentIndex={currentIndex}
        followCamera={followCamera}
        showTrail={showTrail}
      />
      
      {/* Camera controls (only when not following) */}
      {!followCamera && (
        <SimpleOrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxDistance={100}
          minDistance={5}
        />
      )}
    </Suspense>
  );
}

export function Enhanced3DSimulation({ data }: Enhanced3DSimulationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followCamera, setFollowCamera] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback control
  useEffect(() => {
    if (!isPlaying || currentIndex >= data.length - 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= data.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, (1000 / playbackSpeed));

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

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setCurrentIndex(value);
  };

  // Keyboard shortcuts
  useEffect(() => {
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
  }, [isFullscreen, isPlaying, currentIndex, data.length]);

  const currentPoint = data[currentIndex] || data[0];
  const progress = ((currentIndex + 1) / data.length) * 100;

  const getEventColor = (event?: string) => {
    switch (event) {
      case 'harsh_braking': return '#f44336';
      case 'harsh_acceleration': return '#ff9800';
      case 'swerving': return '#2196f3';
      case 'over_speed': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No simulation data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Upload CSV data to see the 3D visualization
          </Typography>
        </CardContent>
      </Card>
    );
  }

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
      <CardContent sx={{ height: isFullscreen ? '100%' : 'auto', display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: isFullscreen ? 'white' : 'inherit' }}>
            <MapIcon sx={{ mr: 1 }} />
            Enhanced 3D Vehicle Simulation
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={followCamera}
                  onChange={(e) => setFollowCamera(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption" sx={{ color: isFullscreen ? 'white' : 'inherit' }}>Follow Camera</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showTrail}
                  onChange={(e) => setShowTrail(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption" sx={{ color: isFullscreen ? 'white' : 'inherit' }}>Show Trail</Typography>}
            />
            <Tooltip title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}>
              <IconButton onClick={toggleFullscreen} color="primary">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 3D Canvas */}
        <Box 
          ref={containerRef}
          sx={{ 
            height: isFullscreen ? 'calc(100vh - 250px)' : 500, 
            borderRadius: 2, 
            position: 'relative',
            mb: 2,
            overflow: 'hidden',
            flex: isFullscreen ? 1 : 'none',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Canvas 
            camera={{ position: [0, 15, 15], fov: 60 }}
            shadows
            gl={{ antialias: true, alpha: false }}
          >
            <Scene 
              data={data}
              currentIndex={currentIndex}
              followCamera={followCamera}
              showTrail={showTrail}
            />
          </Canvas>

          {/* Current stats overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(255,255,255,0.95)',
              p: 2,
              borderRadius: 1,
              minWidth: 200,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon fontSize="small" />
                <Typography variant="body2" fontWeight="bold">
                  Speed: {currentPoint.speed?.toFixed(1) || '0.0'} km/h
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon fontSize="small" />
                <Typography variant="body2">
                  Score: {currentPoint.score || 0}/100
                </Typography>
              </Box>
              <Typography variant="body2">
                Time: {currentPoint.time || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Position: {currentIndex + 1} / {data.length}
              </Typography>
              {currentPoint.ax !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  Accel: X={currentPoint.ax.toFixed(2)}G, Y={currentPoint.ay?.toFixed(2)}G, Z={currentPoint.az?.toFixed(2)}G
                </Typography>
              )}
            </Stack>
            {isFullscreen && (
              <Typography variant="caption" sx={{ mt: 1, opacity: 0.7, display: 'block' }}>
                Press F to exit fullscreen • Space to play/pause • R to reset
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
                icon={<WarningIcon />}
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
          gap: 2, 
          mb: 2,
          flexWrap: 'wrap',
          bgcolor: isFullscreen ? 'rgba(0,0,0,0.8)' : 'transparent',
          p: isFullscreen ? 1 : 0,
          borderRadius: isFullscreen ? 1 : 0
        }}>
          <IconButton onClick={handleReset} size="small" sx={{ color: isFullscreen ? 'white' : 'inherit' }}>
            <ReplayIcon />
          </IconButton>
          <IconButton onClick={handlePlay} color="primary" size="large">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: isFullscreen ? 'white' : 'inherit' }}>Speed:</Typography>
            {[0.5, 1, 2, 4].map(speed => (
              <Button
                key={speed}
                size="small"
                variant={playbackSpeed === speed ? "contained" : "outlined"}
                onClick={() => setPlaybackSpeed(speed)}
                sx={{ 
                  minWidth: 40,
                  color: isFullscreen && playbackSpeed !== speed ? 'white' : 'inherit',
                  borderColor: isFullscreen && playbackSpeed !== speed ? 'white' : 'inherit'
                }}
              >
                {speed}x
              </Button>
            ))}
          </Box>
        </Box>

        {/* Progress slider */}
        <Box sx={{ px: 2, mb: 1 }}>
          <Slider
            value={currentIndex}
            min={0}
            max={Math.max(0, data.length - 1)}
            onChange={handleSliderChange}
            size="small"
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                bgcolor: isFullscreen ? 'white' : 'primary.main'
              },
              '& .MuiSlider-track': {
                bgcolor: isFullscreen ? 'white' : 'primary.main'
              },
              '& .MuiSlider-rail': {
                bgcolor: isFullscreen ? 'rgba(255,255,255,0.3)' : 'grey.300'
              }
            }}
          />
        </Box>

        {/* Progress bar */}
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: isFullscreen ? 'rgba(255,255,255,0.3)' : 'grey.300',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'primary.main'
              }
            }}
          />
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
