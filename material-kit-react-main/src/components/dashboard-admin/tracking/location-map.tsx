"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsIcon from '@mui/icons-material/Directions';

// Define interface for location data
interface LocationData {
  latitude: number;
  longitude: number;
  speed?: number;
  direction?: number;
}

// Custom marker icon
let DefaultIcon = L.icon({
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Car icon for more visual appeal
let CarIcon = L.icon({
  iconUrl: '/assets/car-marker.png', // You'll need to add this asset
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  selectedCar?: string | null;
}

export function LocationMap({ selectedCar }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routePoints, setRoutePoints] = useState<L.LatLng[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map once when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        // Create the map only if it hasn't been initialized yet
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true
        }).setView([21.4858, 39.1925], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add scale control
        L.control.scale().addTo(map);

        // Store map instance in ref
        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    }

    // Cleanup when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - run once on mount

  // Set up the data polling in a separate effect
  useEffect(() => {
    // Don't proceed if map isn't initialized
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    let lastFetchTime = 0;
    let consecutiveErrors = 0;

    const updateMarker = (location: LocationData) => {
      try {
        // Create a new point for the route
        const newPoint = new L.LatLng(location.latitude, location.longitude);
        
        // Update route points and draw polyline
        const updatedPoints = [...routePoints, newPoint];
        setRoutePoints(updatedPoints);
        
        // Remove previous polyline if it exists
        if (routeRef.current) {
          map.removeLayer(routeRef.current);
        }
        
        // Draw new route line if we have at least 2 points
        if (updatedPoints.length >= 2) {
          const routeLine = L.polyline(updatedPoints, {
            color: '#4a90e2',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round'
          }).addTo(map);
          
          routeRef.current = routeLine;
        }

        // Remove previous marker if it exists
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Calculate rotation for the marker based on direction
        const rotationAngle = location.direction || 0;

        // Add new marker with custom icon if available
        const newMarker = L.marker([location.latitude, location.longitude], {
          icon: CarIcon || DefaultIcon,
          rotationAngle: rotationAngle // Requires leaflet-rotatedmarker plugin
        })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <b>Vehicle ${selectedCar || 'Unknown'}</b><br/>
              Speed: ${location.speed || 0} km/h<br/>
              Heading: ${location.direction || 0}°
            </div>
          `);

        markerRef.current = newMarker;
        
        // Pan to the new location smoothly
        map.panTo(new L.LatLng(location.latitude, location.longitude), {
          animate: true,
          duration: 1
        });
        
        // Update state with current speed and direction
        setCurrentSpeed(location.speed || 0);
        setCurrentDirection(location.direction || 0);
        
        // Reset error counter on success
        consecutiveErrors = 0;
      } catch (err) {
        console.error('Error updating marker:', err);
        consecutiveErrors++;
        
        if (consecutiveErrors > 5) {
          setError('Connection issues detected');
        }
      }
    };

    // Function to fetch latest location data
    const fetchLocationData = () => {
      const now = Date.now();
      // Rate limit requests to no more than once per second
      if (now - lastFetchTime < 1000) return;
      
      lastFetchTime = now;
      
      const url = selectedCar 
        ? `http://localhost:8000/api/get-car-location/${selectedCar}/`
        : 'http://localhost:8000/api/get-latest-data/';
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            updateMarker(data[0]);
          } else if (data && data.latitude) {
            // Handle case where API returns direct object instead of array
            updateMarker(data);
          }
        })
        .catch(error => {
          console.error('Error fetching location data:', error);
          consecutiveErrors++;
          
          if (consecutiveErrors > 5) {
            setError('Failed to fetch location data');
          }
        });
    };

    // Initial fetch
    fetchLocationData();
    
    // Set up polling interval
    const interval = setInterval(fetchLocationData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [selectedCar, routePoints]); // Dependency on selectedCar to refetch when car changes

  // Speed and direction counters
  const SpeedCounter = () => (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2c3e50, #4a90e2)',
        color: 'white',
        border: '2px solid #fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >
      <SpeedIcon sx={{ fontSize: 18, mb: 0.5 }} />
      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
        {currentSpeed}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '10px' }}>
        km/h
      </Typography>
    </Paper>
  );

  const DirectionIndicator = () => (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: '20px',
        left: '110px',
        zIndex: 1000,
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2c3e50, #4a90e2)',
        color: 'white',
        border: '2px solid #fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >
      <DirectionsIcon 
        sx={{ 
          fontSize: 24, 
          transform: `rotate(${currentDirection}deg)`,
          transition: 'transform 0.3s ease'
        }} 
      />
      <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>
        {currentDirection}°
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {isLoading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 1500
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 1200, 
            padding: '8px 16px',
            backgroundColor: 'error.light',
            color: 'error.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Paper>
      )}
      
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      <SpeedCounter />
      <DirectionIndicator />
    </Box>
  );
}