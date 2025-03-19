'use client';

import { useState } from 'react';
import { 
  Box, 
  Stack, 
  Grid, 
  Typography, 
  Paper,
  Card,
  CardHeader,
  Divider 
} from '@mui/material';
import dynamic from 'next/dynamic';
import MapIcon from '@mui/icons-material/Map';
import FenceIcon from '@mui/icons-material/Fence';
import { GeofencesList } from '@/components/dashboard-admin/geofencing/geofences-list';

// Import map component dynamically to prevent SSR issues
const GeofencingMapComponent = dynamic(
  () => import('@/components/dashboard-admin/geofencing/geofencing-map').then(mod => mod.GeofencingMap),
  { ssr: false }
);

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: 'circle' | 'polygon';
  coordinates: [number, number][] | [number, number]; // polygon points or center point
  radius?: number; // For circle type
  color: string;
  active: boolean;
  createdAt: string;
}

export default function GeofencingPage() {
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [geofences, setGeofences] = useState<Geofence[]>([
    {
      id: '1',
      name: 'Office Zone',
      description: 'Main office parking area',
      type: 'circle',
      coordinates: [21.4858, 39.1925],
      radius: 500,
      color: '#ff4444',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Delivery Zone',
      description: 'Northeast delivery area',
      type: 'polygon',
      coordinates: [
        [21.5058, 39.2125],
        [21.5158, 39.2225],
        [21.5058, 39.2325],
        [21.4958, 39.2225]
      ],
      color: '#33aa33',
      active: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const handleSelectGeofence = (id: string | null) => {
    setSelectedGeofence(id);
    setIsCreating(false);
  };

  const handleCreateGeofence = () => {
    setSelectedGeofence(null);
    setIsCreating(true);
  };

  const handleSaveGeofence = (geofence: Geofence) => {
    setGeofences((prev) => {
      // If it's an existing geofence, update it
      if (prev.some(g => g.id === geofence.id)) {
        return prev.map(g => g.id === geofence.id ? geofence : g);
      }
      // Otherwise add new one
      return [...prev, geofence];
    });
    setIsCreating(false);
    setSelectedGeofence(geofence.id);
  };

  const handleDeleteGeofence = (id: string) => {
    setGeofences((prev) => prev.filter(g => g.id !== id));
    if (selectedGeofence === id) {
      setSelectedGeofence(null);
    }
  };

  const handleToggleActive = (id: string) => {
    setGeofences((prev) => 
      prev.map(g => g.id === id ? { ...g, active: !g.active } : g)
    );
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <FenceIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" fontWeight="600" color="primary.main">Geofencing Management</Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              borderRadius: 2, 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FenceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Geofences</Typography>
                  </Box>
                }
                sx={{ backgroundColor: 'background.paper', pb: 1 }}
              />
              <Divider />
              <GeofencesList 
                geofences={geofences}
                selectedGeofenceId={selectedGeofence}
                onSelect={handleSelectGeofence}
                onCreate={handleCreateGeofence}
                onDelete={handleDeleteGeofence}
                onToggleActive={handleToggleActive}
              />
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MapIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Geofencing Map</Typography>
                  </Box>
                }
                sx={{ backgroundColor: 'background.paper', pb: 1 }}
              />
              <Divider />
              <Box sx={{ height: '600px', width: '100%', position: 'relative' }}>
                {isCreating ? (
                  <GeofencingMapComponent 
                    geofences={geofences}
                    selectedGeofenceId={selectedGeofence}
                    onSelectGeofence={handleSelectGeofence}
                    editMode={true}
                    onGeometryChange={handleGeometryChange}
                  />
                ) : (
                  <GeofencingMapComponent 
                    geofences={geofences}
                    selectedGeofenceId={selectedGeofence}
                    onSelectGeofence={handleSelectGeofence}
                  />
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}