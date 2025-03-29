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
  // Get user info from localStorage
  const [userType, setUserType] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // Set up user information when component mounts
  useEffect(() => {
    console.log("Checking localStorage for user credentials...");
    
    // Debug: Log all localStorage items for inspection
    console.log("All localStorage items:", Object.keys(localStorage).map(key => ({
      key,
      value: localStorage.getItem(key)
    })));
    
    // First, try the direct userType and userId that we now save from the login response
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');
    
    if (userType && userId) {
      console.log(`✅ User detected from direct keys! Type: ${userType}, ID: ${userId}`);
      setUserType(userType);
      setUserId(userId);
      return;
    }
    
    // If direct keys are not found, check for company or customer specific IDs
    const companyId = localStorage.getItem('company-id');
    console.log("Company ID from localStorage:", companyId);
    
    if (companyId) {
      console.log("✅ Company detected! Setting userType=company, userId=", companyId);
      setUserType('company');
      setUserId(companyId);
      return;
    }
    
    // Check if we're logged in as a customer
    const customerId = localStorage.getItem('customer-id');
    console.log("Customer ID from localStorage:", customerId);
    
    if (customerId) {
      console.log("✅ Customer detected! Setting userType=customer, userId=", customerId);
      setUserType('customer');
      setUserId(customerId);
      return;
    }
    
    // No user credentials found
    console.log("❌ No user detected. Setting error message.");
    setError('Unable to determine user type. Please log in again.');
  }, []);

  // Fetch geofences from Django when user info is available
  useEffect(() => {
    if (userType && userId) {
      fetchGeofences();
    }
  }, [userType, userId]); // Added userType and userId as dependencies

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

  // Function to fetch geofences from Django
  const fetchGeofences = async () => {
    if (!userType || !userId) {
      setError('User information not available. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Update URL to include userType and userId as query parameters
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/geofences/?userType=${userType}&userId=${userId}`);
      
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
    // Reset UI state
    setIsCreating(false);
    setIsEditing(false);
    
    // Don't update the state manually, just fetch fresh data from the server
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
      // Get user type and ID from localStorage
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      
      if (!userType || !userId) {
        showNotification('User information not available. Please log in again.', 'error');
        return;
      }
      
      // Optimistically update UI first for responsiveness
      setGeofences(prev => prev.filter(g => g.id !== id));
      
      // Then make the API call with user type and ID as query parameters
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/geofences/${id}/delete/?userType=${userType}&userId=${userId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete geofence');
      }
      
      // If the deleted geofence was selected, clear selection
      if (selectedGeofence === id) {
        setSelectedGeofence(null);
      }
      
      showNotification('Geofence deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting geofence:', err);
      // If delete failed, revert the state change by re-fetching
      fetchGeofences();
      showNotification('Failed to delete geofence', 'error');
    }
  };

  // Handle toggling a geofence's active state
const handleToggleActive = async (id: string) => {
  const geofence = geofences.find(g => g.id === id);
  if (!geofence) return;

  // Get user type and ID from localStorage
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');
  
  if (!userType || !userId) {
    showNotification('User information not available. Please log in again.', 'error');
    return;
  }

  console.log(`Toggling geofence ${id} active status with userType: ${userType}, userId: ${userId}`);

  // Update local state for immediate UI feedback
  setGeofences(prevGeofences =>
    prevGeofences.map(g => g.id === id ? { ...g, active: !g.active } : g)
  );
  
  try {
    // Make API call to update geofence active status
    const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/geofences/${id}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        active: !geofence.active,
        userType: userType,
        userId: userId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update geofence status');
    }
    
    showNotification(`Geofence ${geofence.active ? 'deactivated' : 'activated'} successfully`, 'success');
  } catch (err) {
    console.error('Error updating geofence status:', err);
    // Revert the UI change if the update failed
    setGeofences(prevGeofences =>
      prevGeofences.map(g => g.id === id ? { ...g, active: geofence.active } : g)
    );
    showNotification('Failed to update geofence status', 'error');
  }
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