'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  Grid, 
  Typography, 
  Paper,
  Card,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import dynamic from 'next/dynamic';
import MapIcon from '@mui/icons-material/Map';
import FenceIcon from '@mui/icons-material/Fence';
import { GeofencesList } from '@/components/dashboard-customer/geofencing/geofences-list';
import { GeofenceCreate } from '@/components/dashboard-customer/geofencing/geofence-create';
import { Geofence } from '@/app/dashboard-customer/geofencing/page';

// Import map component dynamically to prevent SSR issues
const GeofencingMapComponent = dynamic(
  () => import('@/components/dashboard-customer/geofencing/geofencing-map').then(mod => mod.GeofencingMap),
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success'
  });
  
  const [tempGeometry, setTempGeometry] = useState<{
    type: 'circle' | 'polygon';
    data: any;
  } | null>(null);
  const [previewColor, setPreviewColor] = useState<string>('#ff4444');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch geofences from Django when component mounts
  useEffect(() => {
    fetchGeofences();
  }, []);

  // Function to fetch geofences from Django
  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/geofences/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched geofences from Django:', data);
      
      setGeofences(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching geofences:', err);
      setError('Failed to load geofences from server');
    } finally {
      setLoading(false);
    }
  };

  const handleGeometryChange = (type: 'circle' | 'polygon', data: any) => {
    setTempGeometry({ type, data });
  };

  const handleColorChange = (color: string) => {
    setPreviewColor(color);
  };

  const handleSelectGeofence = (id: string | null) => {
    setSelectedGeofence(id);
    if (id) {
      const selectedFence = geofences.find(g => g.id === id);
      if (selectedFence) {
        setIsEditing(true);
        setIsCreating(true);
        // Set initial geometry for editing
        if (selectedFence.type === 'circle') {
          setTempGeometry({
            type: 'circle',
            data: {
              center: selectedFence.coordinates as [number, number],
              radius: selectedFence.radius
            }
          });
        } else {
          setTempGeometry({
            type: 'polygon',
            data: {
              coordinates: selectedFence.coordinates as [number, number][]
            }
          });
        }
        setPreviewColor(selectedFence.color);
      }
    } else {
      setIsEditing(false);
      setIsCreating(false);
      setTempGeometry(null);
    }
  };

  const handleCreateGeofence = () => {
    setSelectedGeofence(null);
    setIsEditing(false);
    setIsCreating(true);
    setTempGeometry(null);
  };

  // Handle saving a geofence (create or update)
  const handleSaveGeofence = (geofence: any) => {
    // Update local state for immediate UI feedback
    if (isEditing && selectedGeofence) {
      // Update existing geofence in state
      setGeofences(prevGeofences => 
        prevGeofences.map(g => g.id === selectedGeofence ? {...geofence, id: selectedGeofence} : g)
      );
    } else {
      // Create a new geofence with a temporary ID
      const newId = Date.now().toString();
      setGeofences(prevGeofences => [
        ...prevGeofences, 
        {...geofence, id: newId, createdAt: new Date().toISOString()}
      ]);
    }
    
    setIsCreating(false);
    setIsEditing(false);
    
    // Fetch fresh data from the server
    fetchGeofences();
    
    // Show success notification
    showNotification(
      isEditing ? 'Geofence updated successfully' : 'Geofence created successfully', 
      'success'
    );
  };

  // Handle deleting a geofence
  const handleDeleteGeofence = async (id: string) => {
    try {
      // Optimistically update UI first for responsiveness
      setGeofences(prev => prev.filter(g => g.id !== id));
      
      // Then make the API call
      const response = await fetch(`http://localhost:8000/api/geofences/${id}/delete/`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete geofence');
      }
      
      // If the deleted geofence was selected, clear selection
      if (selectedGeofence === id) {
        setSelectedGeofence(null);
      }
      
      // Optionally re-fetch from server to ensure sync
      fetchGeofences();
      
    } catch (err) {
      console.error('Error deleting geofence:', err);
      // If delete failed, revert the state change by re-fetching
      fetchGeofences();
    }
  };

  // Handle toggling a geofence's active state
  const handleToggleActive = (id: string) => {
    const geofence = geofences.find(g => g.id === id);
    if (!geofence) return;
  
    // Update local state for immediate UI feedback
    setGeofences(prevGeofences =>
      prevGeofences.map(g => g.id === id ? { ...g, active: !g.active } : g)
    );
    
    // Fetch fresh data from the server
    fetchGeofences();
    
    showNotification(`Geofence ${geofence.active ? 'deactivated' : 'activated'} successfully`, 'success');
  };

  // Helper function to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <FenceIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" fontWeight="600" color="primary.main">Geofencing Management</Typography>
        </Paper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            {isCreating ? (
              <GeofenceCreate
                onSave={handleSaveGeofence}
                onCancel={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedGeofence(null);
                  setTempGeometry(null);
                }}
                geometry={tempGeometry}
                onColorChange={handleColorChange}
                initialColor={previewColor}
                editGeofence={isEditing ? geofences.find(g => g.id === selectedGeofence) : undefined}
              />
            ) : (
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
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <GeofencesList 
                    geofences={geofences}
                    selectedGeofenceId={selectedGeofence}
                    onSelect={handleSelectGeofence}
                    onCreate={handleCreateGeofence}
                    onDelete={handleDeleteGeofence}
                    onToggleActive={handleToggleActive}
                  />
                )}
              </Card>
            )}
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
                {loading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    zIndex: 1000
                  }}>
                    <CircularProgress />
                  </Box>
                )}
                <GeofencingMapComponent 
                  geofences={geofences}
                  selectedGeofenceId={selectedGeofence}
                  onSelectGeofence={handleSelectGeofence}
                  editMode={isCreating}
                  onGeometryChange={handleGeometryChange}
                  previewGeometry={tempGeometry ? {
                    ...tempGeometry,
                    color: previewColor
                  } : null}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}