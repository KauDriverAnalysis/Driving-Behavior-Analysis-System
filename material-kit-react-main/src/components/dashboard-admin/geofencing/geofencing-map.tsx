"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { Geofence } from '@/app/dashboard-admin/geofencing/page';

// Make sure leaflet-draw is available in browser environment
let LeafletDraw: any;
if (typeof window !== 'undefined') {
  require('leaflet-draw');
  LeafletDraw = require('leaflet-draw');
}

// Custom marker icon
const DefaultIcon = L.icon({
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GeofencingMapProps {
  geofences: Geofence[];
  selectedGeofenceId: string | null;
  onSelectGeofence: (id: string | null) => void;
  editMode?: boolean;
  onGeometryChange?: (type: 'circle' | 'polygon', data: any) => void;
}

export function GeofencingMap({ 
  geofences, 
  selectedGeofenceId, 
  onSelectGeofence,
  editMode = false,
  onGeometryChange
}: GeofencingMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geofencesLayerRef = useRef<L.LayerGroup | null>(null);
  const drawControlRef = useRef<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  // Initialize the map once when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        // Create the map
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

        // Create layer for geofences
        const geofencesLayer = L.layerGroup().addTo(map);
        geofencesLayerRef.current = geofencesLayer;

        // Handle draw controls if in edit mode
        if (editMode && typeof LeafletDraw !== 'undefined') {
          drawnItemsRef.current = new L.FeatureGroup();
          map.addLayer(drawnItemsRef.current);

          const drawControl = new L.Control.Draw({
            draw: {
              polyline: false,
              rectangle: false,
              marker: false,
              circlemarker: false,
              polygon: {
                allowIntersection: false,
                showArea: true
              },
              circle: true
            },
            edit: {
              featureGroup: drawnItemsRef.current,
              remove: false
            }
          });
          map.addControl(drawControl);
          drawControlRef.current = drawControl;

          // Handle draw events
          map.on(L.Draw.Event.CREATED, (e: any) => {
            const layer = e.layer;
            drawnItemsRef.current?.clearLayers();
            drawnItemsRef.current?.addLayer(layer);

            // Notify parent component about geometry changes
            if (onGeometryChange) {
              if (e.layerType === 'circle') {
                onGeometryChange('circle', {
                  center: [layer.getLatLng().lat, layer.getLatLng().lng],
                  radius: layer.getRadius()
                });
              } else if (e.layerType === 'polygon') {
                const points = layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
                onGeometryChange('polygon', { coordinates: points });
              }
            }
          });

          map.on(L.Draw.Event.EDITED, (e: any) => {
            const layers = e.layers;
            layers.eachLayer((layer: any) => {
              if (layer instanceof L.Circle) {
                onGeometryChange?.('circle', {
                  center: [layer.getLatLng().lat, layer.getLatLng().lng],
                  radius: layer.getRadius()
                });
              } else if (layer instanceof L.Polygon) {
                const points = layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
                onGeometryChange?.('polygon', { coordinates: points });
              }
            });
          });
        }

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
  }, [editMode, onGeometryChange]);

  // Update geofences on the map when they change
  useEffect(() => {
    if (!mapInstanceRef.current || !geofencesLayerRef.current) return;

    // Clear existing geofences
    geofencesLayerRef.current.clearLayers();

    // Add each geofence to the map
    geofences.forEach(geofence => {
      try {
        let layer;
        
        if (geofence.type === 'circle' && !Array.isArray(geofence.coordinates[0])) {
          // Create circle
          const [lat, lng] = geofence.coordinates as [number, number];
          const radius = geofence.radius || 100;
          
          layer = L.circle([lat, lng], {
            radius,
            color: geofence.color,
            fillColor: geofence.color,
            fillOpacity: 0.2,
            weight: selectedGeofenceId === geofence.id ? 3 : 2,
            opacity: geofence.active ? 1 : 0.5
          });
        } else if (geofence.type === 'polygon' && Array.isArray(geofence.coordinates[0])) {
          // Create polygon
          const points = geofence.coordinates as [number, number][];
          const latLngs = points.map(([lat, lng]) => L.latLng(lat, lng));
          
          layer = L.polygon(latLngs, {
            color: geofence.color,
            fillColor: geofence.color,
            fillOpacity: 0.2,
            weight: selectedGeofenceId === geofence.id ? 3 : 2,
            opacity: geofence.active ? 1 : 0.5
          });
        }
        
        if (layer) {
          layer.bindPopup(`
            <div>
              <strong>${geofence.name}</strong>
              ${geofence.description ? `<br/>${geofence.description}` : ''}
              <br/>Status: ${geofence.active ? 'Active' : 'Inactive'}
            </div>
          `);
          
          layer.on('click', () => {
            onSelectGeofence(geofence.id);
          });
          
          geofencesLayerRef.current?.addLayer(layer);
          
          // If this is the selected geofence, fit the map to it
          if (selectedGeofenceId === geofence.id && !editMode) {
            const map = mapInstanceRef.current;
            if (geofence.type === 'circle') {
              const [lat, lng] = geofence.coordinates as [number, number];
              const radius = geofence.radius || 100;
              map?.fitBounds(L.latLng(lat, lng).toBounds(radius * 2));
            } else {
              const points = geofence.coordinates as [number, number][];
              const latLngs = points.map(([lat, lng]) => L.latLng(lat, lng));
              map?.fitBounds(L.latLngBounds(latLngs));
            }
          }
        }
      } catch (err) {
        console.error(`Error rendering geofence ${geofence.id}:`, err);
      }
    });
  }, [geofences, selectedGeofenceId, onSelectGeofence, editMode]);

  // Initialize the drawing tools with existing geometry in edit mode
  useEffect(() => {
    if (
      editMode && 
      drawnItemsRef.current && 
      selectedGeofenceId && 
      mapInstanceRef.current
    ) {
      drawnItemsRef.current.clearLayers();
      
      const selectedGeofence = geofences.find(g => g.id === selectedGeofenceId);
      
      if (selectedGeofence) {
        let layer;
        
        if (selectedGeofence.type === 'circle') {
          const [lat, lng] = selectedGeofence.coordinates as [number, number];
          layer = L.circle([lat, lng], {
            radius: selectedGeofence.radius || 100,
            color: selectedGeofence.color
          });
        } else if (selectedGeofence.type === 'polygon') {
          const points = selectedGeofence.coordinates as [number, number][];
          const latLngs = points.map(([lat, lng]) => L.latLng(lat, lng));
          layer = L.polygon(latLngs, {
            color: selectedGeofence.color
          });
        }
        
        if (layer) {
          drawnItemsRef.current.addLayer(layer);
          mapInstanceRef.current.fitBounds(layer.getBounds());
        }
      }
    }
  }, [selectedGeofenceId, geofences, editMode]);

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
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 1200
          }}
        >
          {error}
        </Alert>
      )}

      {editMode && (
        <Alert 
          severity="info" 
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1200
          }}
        >
          Draw a circle or polygon on the map to create a geofence
        </Alert>
      )}
      
      <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />

      {!editMode && geofences.length === 0 && !isLoading && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            padding: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6">No Geofences Defined</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a geofence to start monitoring geographic boundaries.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}