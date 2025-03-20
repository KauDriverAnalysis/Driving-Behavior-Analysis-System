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
import { v4 as uuidv4 } from 'uuid';
import { Geofence } from '@/app/dashboard-admin/geofencing/page';

interface GeofenceCreateProps {
  onSave: (geofence: Geofence) => void;
  onCancel: () => void;
  editGeofence?: Geofence;
  geometry: {
    type: 'circle' | 'polygon';
    data: any;
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
}: GeofenceCreateProps) {
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

  const validateForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !geometry) {
      return;
    }
    
    const geofenceData: Omit<Geofence, 'id' | 'createdAt'> = {
      name,
      description: description || undefined,
      type: geometry.type,
      coordinates: geometry.type === 'circle' 
        ? geometry.data.center 
        : geometry.data.coordinates,
      radius: geometry.type === 'circle' ? geometry.data.radius : undefined,
      color,
      active: editGeofence?.active !== undefined ? editGeofence.active : true,
    };

    try {
      let response;
      let resultGeofence;

      // Check if we're editing an existing geofence or creating a new one
      if (editGeofence) {
        // Update existing geofence
        response = await fetch(`http://localhost:8000/api/geofences/${editGeofence.id}/update/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geofenceData),
        });

        if (!response.ok) {
          throw new Error('Failed to update geofence');
        }

        resultGeofence = await response.json();
      } else {
        // Create new geofence
        response = await fetch('http://localhost:8000/api/geofences/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geofenceData),
        });

        if (!response.ok) {
          throw new Error('Failed to create geofence');
        }

        resultGeofence = await response.json();
      }

      // Pass the result back to the parent component
      onSave(resultGeofence);
    } catch (err) {
      console.error(`Error ${editGeofence ? 'updating' : 'creating'} geofence:`, err);
      setFormErrors(prev => ({ 
        ...prev, 
        geometry: `Failed to ${editGeofence ? 'update' : 'create'} geofence. Please try again.` 
      }));
    }
  };

  const handleColorChange = (e: any) => {
    const newColor = e.target.value;
    setColor(newColor);
    onColorChange?.(newColor);
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
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            
            <TextField
              label="Description (optional)"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            
            {formErrors.geometry && (
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