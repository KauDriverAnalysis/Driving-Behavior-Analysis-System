'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
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

// Add the missing Segment interface
interface Segment {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  event?: string;
  score: number;
}

interface ThreeJSCarProps {
  position: { x: number; y: number; z: number };
  rotation: number;
  color: string;
  hasEvent: boolean;
  eventColor?: string;
}

// 3D Car component using Three.js
function ThreeJSCar({ position, rotation, color, hasEvent, eventColor }: ThreeJSCarProps) {
  const meshRef = React.useRef<THREE.Group>(null);
  const carColor = hasEvent ? eventColor || '#f44336' : color;
  const roofColor = hasEvent ? eventColor || '#f44336' : '#cc5555';

  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z);
      meshRef.current.rotation.y = rotation;
    }
  }, [position, rotation]);

  return (
    <group ref={meshRef}>
      {/* Car body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.3, 2.0]} />
        <meshPhongMaterial color={carColor} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.2, 1.2]} />
        <meshPhongMaterial color={roofColor} />
      </mesh>
      
      {/* Wheels */}
      {[
        [-0.5, 0, 0.7] as [number, number, number],   // Front left
        [0.5, 0, 0.7] as [number, number, number],    // Front right
        [-0.5, 0, -0.7] as [number, number, number],  // Rear left
        [0.5, 0, -0.7] as [number, number, number]    // Rear right
      ].map((pos, index) => (
        <mesh key={index} position={pos}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshPhongMaterial color="#333" />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh position={[-0.3, 0.25, 1.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffff99" />
      </mesh>
      <mesh position={[0.3, 0.25, 1.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffff99" />
      </mesh>

      {/* Event indicator */}
      {hasEvent && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  );
}

// Trail component for route visualization
function RouteTrail({ data, currentIndex }: { data: Segment[]; currentIndex: number }) {
  const trailRef = React.useRef<THREE.BufferGeometry>(null);

  React.useEffect(() => {
    if (!trailRef.current || data.length === 0) return;

    const visibleData = data.slice(0, currentIndex + 1);
    if (visibleData.length < 2) return;

    // Calculate positions relative to the route bounds
    const lats = data.map(d => d.lat);
    const lngs = data.map(d => d.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const points = visibleData.map(point => {
      const normalizedX = maxLng !== minLng ? (point.lng - minLng) / (maxLng - minLng) : 0.5;
      const normalizedZ = maxLat !== minLat ? (point.lat - minLat) / (maxLat - minLat) : 0.5;
      
      const x = (normalizedX - 0.5) * 20; // Scale to world coordinates
      const z = (normalizedZ - 0.5) * 20;
      
      return new THREE.Vector3(x, 0.1, z);
    });

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, points.length * 2, 0.05, 8, false);
    
    trailRef.current.copy(geometry);
  }, [data, currentIndex]);

  return (
    <mesh>
      <bufferGeometry ref={trailRef} />
      <meshBasicMaterial color="#4ecdc4" transparent opacity={0.8} />
    </mesh>
  );
}

interface Simulation3DThreeJSProps {
  data: Segment[];
}

export function Simulation3DThreeJS({ data }: Simulation3DThreeJSProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [followCamera, setFollowCamera] = React.useState(true);

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

  // Calculate car position in 3D space
  const getCarPosition3D = (point: Segment) => {
    if (!data.length) return { x: 0, y: 1, z: 0 };
    
    // Find min/max bounds of the entire route
    const lats = data.map(d => d.lat);
    const lngs = data.map(d => d.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Normalize position within bounds (0-1)
    const normalizedX = maxLng !== minLng ? (point.lng - minLng) / (maxLng - minLng) : 0.5;
    const normalizedZ = maxLat !== minLat ? (point.lat - minLat) / (maxLat - minLat) : 0.5;
    
    // Convert to world coordinates
    const x = (normalizedX - 0.5) * 20;
    const z = (normalizedZ - 0.5) * 20;
    
    return { x, y: 1, z };
  };

  // Calculate car rotation based on movement direction
  const getCarRotation3D = (currentIdx: number) => {
    if (currentIdx === 0 || currentIdx >= data.length - 1) return 0;
    
    const current = data[currentIdx];
    const next = data[currentIdx + 1];
    
    const currentPos = getCarPosition3D(current);
    const nextPos = getCarPosition3D(next);
    
    const deltaX = nextPos.x - currentPos.x;
    const deltaZ = nextPos.z - currentPos.z;
    
    // Calculate angle in radians
    const angle = Math.atan2(deltaX, deltaZ);
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

  const carPosition = getCarPosition3D(currentPoint);
  const carRotation = getCarRotation3D(currentIndex);

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
            Real 3D Route Simulation
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={followCamera ? "contained" : "outlined"}
              onClick={() => setFollowCamera(!followCamera)}
              sx={{ color: isFullscreen && !followCamera ? 'white' : 'inherit' }}
            >
              Camera: {followCamera ? 'Follow' : 'Free'}
            </Button>
            <Tooltip title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}>
              <IconButton onClick={toggleFullscreen} color="primary">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 3D Visualization Area with Three.js */}
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
          <Canvas 
            camera={{ position: followCamera ? [carPosition.x + 5, 8, carPosition.z + 5] : [0, 15, 15], fov: 60 }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
            <pointLight position={[0, 10, 0]} intensity={0.3} />
            
            {/* Ground grid */}
            <Grid args={[50, 50]} cellSize={1} cellThickness={0.5} cellColor="#333" sectionSize={10} sectionThickness={1} sectionColor="#555" />
            
            {/* Route trail */}
            <RouteTrail data={data} currentIndex={currentIndex} />
            
            {/* 3D Car */}
            <ThreeJSCar
              position={carPosition}
              rotation={carRotation}
              color={currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}
              hasEvent={!!currentPoint.event}
              eventColor={currentPoint.event ? getEventColor(currentPoint.event) : undefined}
            />
            
            {/* Camera controls */}
            {!followCamera && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
          </Canvas>

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
