"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';

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
  iconUrl: '/assets/marker-icon.png', // You'll need to add this asset
  iconSize: [25, 41],
  iconAnchor: [12, 41]

});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  selectedCar?: string | null;
}

export function LocationMap({ selectedCar }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<{[carId: string]: L.Marker}>({});
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routePoints, setRoutePoints] = useState<L.LatLng[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map once when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        // Create map and add layer group for markers
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true
        }).setView([21.4858, 39.1925], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.control.scale().addTo(map);
        
        // Add a layer group for all markers
        const markerLayer = L.layerGroup().addTo(map);
        markerLayerRef.current = markerLayer;
        
        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Set up the data polling in a separate effect with 15-second interval
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    let lastFetchTime = 0;
    let consecutiveErrors = 0;

    const updateMarkers = (locations: any) => {
      try {
        if (!mapInstanceRef.current || !markerLayerRef.current) return;
        
        const map = mapInstanceRef.current;
        
        // If selectedCar is set, handle single car mode
        if (selectedCar) {
          // Find the selected car's location data
          const location = Array.isArray(locations) 
            ? locations.find(loc => loc.id?.toString() === selectedCar?.toString())
            : locations;
            
          if (!location) return;
          
          // Clear previous route if any
          if (routeRef.current) {
            map.removeLayer(routeRef.current);
          }
          
          // Clear all markers
          markerLayerRef.current.clearLayers();
          markersRef.current = {};
          
          // Create new point and update route
          const newPoint = new L.LatLng(location.latitude, location.longitude);
          const updatedPoints = [...routePoints, newPoint];
          setRoutePoints(updatedPoints);
          
          // Draw route line if we have multiple points
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
          
          // Add marker for selected car
          const rotationAngle = location.direction || 0;
          const newMarker = L.marker([location.latitude, location.longitude], {
            icon: CarIcon || DefaultIcon,
          })
            .addTo(markerLayerRef.current)
            .bindPopup(`
              <div style="text-align: center;">
                <b>${location.model || 'Vehicle ' + selectedCar}</b><br/>
                Speed: ${location.speed || 0} km/h<br/>
                Plate: ${location.plate || 'Unknown'}
              </div>
            `);
            
          // Update speed display
          setCurrentSpeed(location.speed || 0);
          
          // Center map on the vehicle
          map.panTo(new L.LatLng(location.latitude, location.longitude), {
            animate: true,
            duration: 1
          });
        } 
        // Handle all cars mode
        else {
          // Clear any existing route
          if (routeRef.current) {
            map.removeLayer(routeRef.current);
            routeRef.current = null;
          }
          
          setRoutePoints([]);
          
          // Clear speed display when no car is selected
          setCurrentSpeed(0);
          
          // Make sure we have an array of locations
          if (!Array.isArray(locations)) return;
          
          // Remove markers that are no longer present
          Object.keys(markersRef.current).forEach(id => {
            if (!locations.find(loc => loc.id?.toString() === id)) {
              if (markersRef.current[id]) {
                markerLayerRef.current?.removeLayer(markersRef.current[id]);
                delete markersRef.current[id];
              }
            }
          });
          
          // Add or update markers for all cars
          locations.forEach(loc => {
            const carId = loc.id?.toString();
            if (!carId) return;
            
            // If marker already exists, update its position
            if (markersRef.current[carId]) {
              markersRef.current[carId].setLatLng([loc.latitude, loc.longitude]);
              // Update popup content
              markersRef.current[carId].getPopup()?.setContent(`
                <div style="text-align: center;">
                  <b>${loc.model || 'Vehicle ' + carId}</b><br/>
                  Speed: ${loc.speed || 0} km/h<br/>
                  Plate: ${loc.plate || 'Unknown'}
                </div>
              `);
            } 
            // Otherwise create a new marker
            else {
              if (markerLayerRef.current) {  // Add null check
                const marker = L.marker([loc.latitude, loc.longitude], {
                  icon: CarIcon || DefaultIcon
                })
                  .addTo(markerLayerRef.current)
                  .bindPopup(`
                    <div style="text-align: center;">
                      <b>${loc.model || 'Vehicle ' + carId}</b><br/>
                      Speed: ${loc.speed || 0} km/h<br/>
                      Plate: ${loc.plate || 'Unknown'}
                    </div>
                  `);
                
                markersRef.current[carId] = marker;
              }
            }
          });
          
          // If we have locations, fit the map to show all markers
          if (locations.length > 0) {
            const group = L.featureGroup(Object.values(markersRef.current));
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
          }
        }
        
        // Reset error counter on success
        consecutiveErrors = 0;
      } catch (err) {
        console.error('Error updating markers:', err);
        consecutiveErrors++;
        
        if (consecutiveErrors > 5) {
          setError('Connection issues detected');
        }
      }
    };

    // Function to fetch location data
    const fetchLocationData = () => {
      const now = Date.now();
      // Rate limit requests to no more than once every 15 seconds
      if (now - lastFetchTime < 15000) return;
      
      lastFetchTime = now;
      
      // Always get all car locations - we'll filter on the frontend
      fetch('https://driving-behavior-analysis-system.onrender.com/api/get-car-location/')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            updateMarkers(data);
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
    
    // Set up polling interval - every 15 seconds
    const interval = setInterval(fetchLocationData, 15000);

    return () => clearInterval(interval);
  }, [selectedCar, routePoints]);

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
    </Box>
  );
}