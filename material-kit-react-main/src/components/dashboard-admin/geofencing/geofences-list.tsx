import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Switch,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import PolygonIcon from '@mui/icons-material/Category';
import { Geofence } from '@/app/dashboard-admin/geofencing/page';

interface GeofencesListProps {
  selectedGeofenceId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
}

export function GeofencesList({
  selectedGeofenceId,
  onSelect,
  onCreate,
}: GeofencesListProps) {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchGeofences();
  }, []);

  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/geofences/');
      const data = await response.json();
      setGeofences(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching geofences:', err);
      setError('Failed to load geofences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const geofence = geofences.find(g => g.id === id);
      if (!geofence) return;

      // Send the complete geofence object with the toggled active status
      const response = await fetch(`http://localhost:8000/api/geofences/${id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...geofence,
          active: !geofence.active
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update geofence status');
      }

      await fetchGeofences();
      showNotification(`Geofence ${geofence.active ? 'deactivated' : 'activated'} successfully`, 'success');
    } catch (err) {
      console.error('Error toggling geofence status:', err);
      showNotification('Failed to update geofence status', 'error');
    }
  };

  const handleDeleteGeofence = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/geofences/${id}/delete/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete geofence');
      }

      await fetchGeofences();
      showNotification('Geofence deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting geofence:', err);
      showNotification('Failed to delete geofence', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Paper 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Geofences</Typography>
          <Button
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreate}
            size="small"
          >
            New
          </Button>
        </Stack>
      </Box>
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : geofences.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No geofences defined yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {geofences.map((geofence) => (
              <React.Fragment key={geofence.id}>
                <ListItem 
                  button
                  selected={selectedGeofenceId === geofence.id}
                  onClick={() => onSelect(geofence.id)}
                  sx={{ 
                    pl: 2, 
                    pr: 6, 
                    py: 1.5,
                    opacity: geofence.active ? 1 : 0.7
                  }}
                >
                  <Box 
                    sx={{ 
                      mr: 1.5, 
                      color: geofence.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {geofence.type === 'circle' ? 
                      <CircleIcon fontSize="small" /> : 
                      <PolygonIcon fontSize="small" />
                    }
                  </Box>
                  
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        noWrap
                        sx={{ fontWeight: selectedGeofenceId === geofence.id ? 600 : 500 }}
                      >
                        {geofence.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {geofence.description || 
                          (geofence.type === 'circle' ? 
                            `Radius: ${geofence.radius}m` : 
                            `${(geofence.coordinates as [number, number][]).length} points`)
                        }
                      </Typography>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title={geofence.active ? "Deactivate" : "Activate"}>
                      <Switch
                        edge="end"
                        size="small"
                        checked={geofence.active}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(geofence.id);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGeofence(geofence.id);
                        }}
                        sx={{ ml: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

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
    </Paper>
  );
}