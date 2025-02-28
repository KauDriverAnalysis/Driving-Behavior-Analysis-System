"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';



let DefaultIcon = L.icon({
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export function LocationMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  // Initialize the map once when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create the map only if it hasn't been initialized yet
      const map = L.map(mapRef.current).setView([21.4858, 39.1925], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Store map instance in ref
      mapInstanceRef.current = map;
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
    
    const updateMarker = (location: { latitude: number; longitude: number; speed?: number }) => {
      // Remove previous marker if it exists
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Add new marker
      const newMarker = L.marker([location.latitude, location.longitude])
        .addTo(map)
        .bindPopup(`Speed: ${location.speed} km/h`);
        
      markerRef.current = newMarker;
      map.setView([location.latitude, location.longitude], map.getZoom());
    };
    
    // Poll for location data
    const interval = setInterval(() => {
      fetch('http://localhost:8000/api/get-latest-data/')
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            updateMarker(data[0]);
          } else if (data && data.latitude) {
            // Handle case where API returns direct object instead of array
            updateMarker(data);
          }
        })
        .catch(error => console.error('Error fetching location data:', error));
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, []); // Empty dependency - starts after map initialization
  
  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}