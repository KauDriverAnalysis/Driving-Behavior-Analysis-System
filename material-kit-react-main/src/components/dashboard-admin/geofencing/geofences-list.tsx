import React from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import PolygonIcon from '@mui/icons-material/Category';
import { Geofence } from '@/app/dashboard-admin/geofencing/page';

interface GeofencesListProps {
  geofences: Geofence[];
  selectedGeofenceId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function GeofencesList({
  geofences,
  selectedGeofenceId,
  onSelect,
  onCreate,
  onDelete,
  onToggleActive
}: GeofencesListProps) {
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
        {geofences.length === 0 ? (
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
                          onToggleActive(geofence.id);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(geofence.id);
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
    </Paper>
  );
}