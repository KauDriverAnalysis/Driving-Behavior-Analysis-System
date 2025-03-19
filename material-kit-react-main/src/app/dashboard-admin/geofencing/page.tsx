'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GeofencingMap } from '@/components/dashboard-admin/geofencing/geofencing-map';
import { GeofencesList } from '@/components/dashboard-admin/geofencing/geofences-list';
import { GeofenceCreate } from '@/components/dashboard-admin/geofencing/geofence-create';

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
    <>
      <Helmet>
        <title>Geofencing | Driving Behavior Analysis</title>
      </Helmet>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Geofencing Management</Typography>
            
            <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
              <Box sx={{ width: '30%', pr: 2 }}>
                <GeofencesList 
                  geofences={geofences}
                  selectedGeofenceId={selectedGeofence}
                  onSelect={handleSelectGeofence}
                  onCreate={handleCreateGeofence}
                  onDelete={handleDeleteGeofence}
                  onToggleActive={handleToggleActive}
                />
              </Box>
              
              <Box sx={{ width: '70%' }}>
                {isCreating ? (
                  <GeofenceCreate onSave={handleSaveGeofence} onCancel={() => setIsCreating(false)} />
                ) : (
                  <GeofencingMap 
                    geofences={geofences}
                    selectedGeofenceId={selectedGeofence}
                    onSelectGeofence={handleSelectGeofence}
                  />
                )}
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}