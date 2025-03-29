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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const handleToggleActive = async (id: string) => {
    try {
      // Get user type and ID from localStorage using the correct keys
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      
      if (!userType || !userId) {
        showNotification('User information not available. Please log in again.', 'error');
        return;
      }
      
      console.log(`Toggling geofence active status with userType: ${userType}, userId: ${userId}`);
      onToggleActive(id);
      showNotification('Geofence status updated successfully', 'success');
    } catch (err) {
      console.error('Error toggling geofence status:', err);
      showNotification('Failed to update geofence status', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setShowDeleteDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    
    try {
      // Get user type and ID from localStorage using the correct keys
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      
      if (!userType || !userId) {
        showNotification('User information not available. Please log in again.', 'error');
        return;
      }
      
      console.log(`Deleting geofence with userType: ${userType}, userId: ${userId}`);
      
      // Call the delete function with the necessary parameters
      onDelete(deleteId);
      showNotification('Geofence deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting geofence:', err);
      showNotification('Failed to delete geofence', 'error');
    }
    
    setDeleteId(null);
    setShowDeleteDialog(false);
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

  // Get user type for customizing the UI
  const userType = localStorage.getItem('userType');
  const isCompany = userType === 'company';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isCompany ? 'Company Geofences' : 'My Geofences'}
          </Typography>
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
                          handleDeleteClick(geofence.id);
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Geofence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this geofence? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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