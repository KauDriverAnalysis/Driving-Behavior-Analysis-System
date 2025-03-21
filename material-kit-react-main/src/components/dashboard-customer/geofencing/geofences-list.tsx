import React, { useEffect, useState } from 'react';
import {
  Box,
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
import { Geofence } from '@/app/dashboard-customer/geofencing/page';

interface GeofencesListProps {
  selectedGeofenceId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  geofences: Geofence[];
}

export function GeofencesList({
  selectedGeofenceId,
  onSelect,
  onCreate,
  onDelete,
  onToggleActive,
  geofences
}: GeofencesListProps) {
  const [loading, setLoading] = useState<boolean>(false);
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

  const handleToggleActive = async (id: string) => {
    try {
      onToggleActive(id);
      showNotification('Geofence status updated successfully', 'success');
    } catch (err) {
      console.error('Error toggling geofence status:', err);
      showNotification('Failed to update geofence status', 'error');
    }
  };

  const handleDeleteGeofence = async (id: string) => {
    try {
      onDelete(id);
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
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">My Geofences</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            size="small"
          >
            Add New
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : geofences.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No geofences defined yet. Create your first geofence to start monitoring.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
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
                  <Box sx={{ mr: 1.5, color: geofence.color }}>
                    {geofence.type === 'circle' ? (
                      <CircleIcon fontSize="small" />
                    ) : (
                      <PolygonIcon fontSize="small" />
                    )}
                  </Box>

                  <ListItemText
                    primary={geofence.name}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {geofence.type === 'circle' 
                          ? `Radius: ${geofence.radius}m`
                          : `${(geofence.coordinates as [number, number][]).length} points`}
                      </Typography>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Tooltip title={geofence.active ? "Disable" : "Enable"}>
                      <Switch
                        edge="end"
                        size="small"
                        checked={geofence.active}
                        onChange={(e) => {
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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