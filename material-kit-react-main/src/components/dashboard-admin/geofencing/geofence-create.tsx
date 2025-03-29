import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import type { Geofence } from '@/app/dashboard-admin/geofencing/page';
import type { SelectChangeEvent } from '@mui/material/Select';

interface GeometryData {
  center?: [number, number];
  coordinates?: [number, number][];
  radius?: number;
}

interface GeofenceCreateProps {
  onSave: (geofence: Geofence) => void;
  onCancel: () => void;
  editGeofence?: Geofence;
  geometry: {
    type: 'circle' | 'polygon';
    data: GeometryData;
  } | null;
  onColorChange?: (color: string) => void;
  initialColor?: string;
}

export function GeofenceCreate({ 
  onSave, 
  onCancel, 
  editGeofence, 
  geometry,
  onColorChange,
  initialColor = '#ff4444'
}: GeofenceCreateProps): React.JSX.Element {
  const [name, setName] = useState(editGeofence?.name || '');
  const [description, setDescription] = useState(editGeofence?.description || '');
  const [color, setColor] = useState(editGeofence?.color || initialColor);

  // Update form when editGeofence changes
  useEffect(() => {
    if (editGeofence) {
      setName(editGeofence.name);
      setDescription(editGeofence.description || '');
      setColor(editGeofence.color);
    }
  }, [editGeofence]);

  const [formErrors, setFormErrors] = useState({
    name: '',
    geometry: ''
  });

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      geometry: ''
    };
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!geometry) {
      errors.geometry = 'Please draw a geofence on the map';
    }
    
    setFormErrors(errors);
    return !errors.name && !errors.geometry;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm() || !geometry) {
      return;
    }
    
    // Get user type and ID from localStorage - using the WORKING keys
    // First, try the direct userType and userId keys
    let userType = localStorage.getItem('userType');
    let userId = localStorage.getItem('userId');
    
    if (!userType || !userId) {
      // Fall back to company or customer specific IDs
      const companyId = localStorage.getItem('company-id');
      if (companyId) {
        userType = 'company';
        userId = companyId;
      } else {
        // Check for customer login
        const customerId = localStorage.getItem('customer-id');
        if (customerId) {
          userType = 'customer';
          userId = customerId;
        }
      }
    }
    
    if (!userType || !userId) {
      setFormErrors(prev => ({
        ...prev,
        geometry: 'User information not available. Please log in again.'
      }));
      return;
    }
    
    // Safely create coordinates and radius based on geometry type
    const coordinates = geometry.type === 'circle' 
      ? geometry.data.center 
      : geometry.data.coordinates;
      
    const radius = geometry.type === 'circle' ? geometry.data.radius : undefined;
    
    if (!coordinates) {
      setFormErrors(prev => ({
        ...prev,
        geometry: 'Invalid geometry data. Please try drawing again.'
      }));
      return;
    }
    
    const geofenceData = {
      name,
      description: description || '',
      type: geometry.type,
      coordinates,
      radius,
      color,
      active: true,
      userType,
      userId
    };

    try {
      let response;

      if (editGeofence) {
        response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/geofences/${editGeofence.id}/update/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...geofenceData,
            userType,
            userId
          }),
        });
      } else {
        response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/geofences/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geofenceData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to save geofence');
      }

      const resultGeofence = await response.json() as Geofence;
      onSave(resultGeofence);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setFormErrors(prev => ({ 
        ...prev, 
        geometry: `Failed to ${editGeofence ? 'update' : 'create'} geofence: ${errorMessage}` 
      }));
    }
  };

  const handleColorChange = (e: SelectChangeEvent): void => {
    const newColor = e.target.value;
    setColor(newColor);
    if (onColorChange) {
      onColorChange(newColor);
    }
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          {editGeofence ? 'Edit Geofence' : 'Create New Geofence'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name || ' '}
              required
            />
            
            <TextField
              label="Description (optional)"
              fullWidth
              value={description}
              onChange={(e) => { setDescription(e.target.value); }}
              multiline
              rows={2}
            />
            
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={color}
                onChange={handleColorChange}
                label="Color"
              >
                <MenuItem value="#ff4444" sx={{ color: '#ff4444' }}>Red</MenuItem>
                <MenuItem value="#33aa33" sx={{ color: '#33aa33' }}>Green</MenuItem>
                <MenuItem value="#3366ff" sx={{ color: '#3366ff' }}>Blue</MenuItem>
                <MenuItem value="#ff9900" sx={{ color: '#ff9900' }}>Orange</MenuItem>
                <MenuItem value="#9933cc" sx={{ color: '#9933cc' }}>Purple</MenuItem>
              </Select>
            </FormControl>
            
            {Boolean(formErrors.geometry) && (
              <FormHelperText error>{formErrors.geometry}</FormHelperText>
            )}
            
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={onCancel}>Cancel</Button>
              <Button variant="contained" type="submit">Save Geofence</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}