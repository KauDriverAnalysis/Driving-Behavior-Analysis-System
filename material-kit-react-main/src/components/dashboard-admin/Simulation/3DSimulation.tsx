'use client';

import * as React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
import ViewInArIcon from '@mui/icons-material/ViewInAr';
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
  const [useMapView, setUseMapView] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const carMarkerRef = React.useRef<L.Marker | null>(null);
  const routeRef = React.useRef<L.Polyline | null>(null);

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
      } else if (event.key === 'm' || event.key === 'M') {
        setUseMapView(!useMapView);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, handlePlay, handleReset, toggleFullscreen, useMapView]);

  // Initialize OpenStreetMap
  React.useEffect(() => {
    if (useMapView && mapRef.current && !mapInstanceRef.current && data.length > 0) {
      // Calculate center from data
      const lats = data.map(d => d.lat);
      const lngs = data.map(d => d.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([centerLat, centerLng], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Create custom car icon
      const carIcon = L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 16px; 
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            border: 2px solid white;
            border-radius: 4px;
            transform: rotate(0deg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">🚗</div>
        `,
        className: 'car-marker',
        iconSize: [32, 16],
        iconAnchor: [16, 8]
      });

      // Add car marker
      const carMarker = L.marker([data[0].lat, data[0].lng], { icon: carIcon }).addTo(map);
      carMarkerRef.current = carMarker;

      // Add route path
      const routePoints = data.map(point => [point.lat, point.lng] as [number, number]);
      const route = L.polyline(routePoints, {
        color: '#2196f3',
        weight: 4,
        opacity: 0.7
      }).addTo(map);
      routeRef.current = route;

      // Fit map to route bounds
      map.fitBounds(route.getBounds(), { padding: [20, 20] });

      mapInstanceRef.current = map;
    }

    // Cleanup map on component unmount or view change
    return () => {
      if (!useMapView && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        carMarkerRef.current = null;
        routeRef.current = null;
      }
    };
  }, [useMapView, data]);

  // Update car position on map
  React.useEffect(() => {
    if (useMapView && carMarkerRef.current && data[currentIndex]) {
      const currentPoint = data[currentIndex];
      carMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);
      
      // Update car icon color based on events
      const carIcon = L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 16px; 
            background: linear-gradient(45deg, ${currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}, ${currentPoint.event ? getEventColor(currentPoint.event) + '88' : '#ff8e8e'});
            border: 2px solid white;
            border-radius: 4px;
            transform: rotate(${getCarRotation(currentIndex)}deg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            ${currentPoint.event ? 'animation: pulse 1s infinite;' : ''}
          ">🚗</div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
              50% { box-shadow: 0 2px 8px ${currentPoint.event ? getEventColor(currentPoint.event) : '#ff6b6b'}66; }
              100% { box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
            }
          </style>
        `,
        className: 'car-marker',
        iconSize: [32, 16],
        iconAnchor: [16, 8]
      });
      carMarkerRef.current.setIcon(carIcon);

      // Update route progress
      if (routeRef.current) {
        mapInstanceRef.current?.removeLayer(routeRef.current);
        const progressPoints = data.slice(0, currentIndex + 1).map(point => [point.lat, point.lng] as [number, number]);
        routeRef.current = L.polyline(progressPoints, {
          color: '#2196f3',
          weight: 4,
          opacity: 0.9
        }).addTo(mapInstanceRef.current!);
      }
    }
  }, [currentIndex, useMapView, data]);

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={useMapView ? "Switch to 3D View (M)" : "Switch to Map View (M)"}>
              <Button
                variant={useMapView ? "contained" : "outlined"}
                size="small"
                onClick={() => setUseMapView(!useMapView)}
                sx={{ color: isFullscreen && !useMapView ? 'white' : 'inherit', borderColor: isFullscreen && !useMapView ? 'white' : 'inherit' }}
              >
                {useMapView ? 'Map' : '3D'}
              </Button>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}>
              <IconButton onClick={toggleFullscreen} color="primary">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Visualization Area */}
        <Box 
          sx={{ 
            height: isFullscreen ? 'calc(100vh - 200px)' : 400, 
            bgcolor: useMapView ? 'transparent' : 'grey.900', 
            borderRadius: 2, 
            position: 'relative',
            mb: 2,
            overflow: 'hidden',
            flex: isFullscreen ? 1 : 'none'
          }}
        >
          {useMapView ? (
            /* OpenStreetMap View */
            <Box
              ref={mapRef}
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 2,
                '& .leaflet-container': {
                  borderRadius: 2
                }
              }}
            />
          ) : (
            /* 3D Canvas View */
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
                </Box>
              </Box>
            </div>
          )}
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