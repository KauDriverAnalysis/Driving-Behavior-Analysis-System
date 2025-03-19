import React, { useState } from 'react';
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
import { GeofencingMap } from './geofencing-map';

interface GeofenceCreateProps {
  onSave: (geofence: Geofence) => void;
  onCancel: () => void;
  editGeofence?: Geofence;
}

export function GeofenceCreate({ onSave, onCancel, editGeofence }: GeofenceCreateProps) {
  const [name, setName] = useState(editGeofence?.name || '');
  const [description, setDescription] = useState(editGeofence?.description || '');
  const [color, setColor] = useState(editGeofence?.color || '#ff4444');
  const [geometry, setGeometry] = useState<{
    type: 'circle' | 'polygon';
    data: any;
  }>({
    type: editGeofence?.type || 'circle',
    data: editGeofence?.type === 'circle' 
      ? { center: editGeofence.coordinates, radius: editGeofence.radius } 
      : { coordinates: editGeofence?.coordinates }
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    geometry: ''
  });

  const handleGeometryChange = (type: 'circle' | 'polygon', data: any) => {
    setGeometry({ type, data });
    setFormErrors(prev => ({ ...prev, geometry: '' }));
  };

  const validateForm = () => {
    const errors = {
      name: '',
      geometry: ''
    };
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!geometry.data) {
      errors.geometry = 'Please draw a geofence on the map';
    }
    
    setFormErrors(errors);
    return !errors.name && !errors.geometry;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const newGeofence: Geofence = {
      id: editGeofence?.id || uuidv4(),
      name,
      description: description || undefined,
      type: geometry.type,
      coordinates: geometry.type === 'circle' 
        ? geometry.data.center 
        : geometry.data.coordinates,
      radius: geometry.type === 'circle' ? geometry.data.radius : undefined,
      color,
      active: editGeofence?.active !== undefined ? editGeofence.active : true,
      createdAt: editGeofence?.createdAt || new Date().toISOString()
    };
    
    onSave(newGeofence);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
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
                onChange={(e) => setColor(e.target.value)}
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
      
      <Box sx={{ flexGrow: 1, height: 'calc(100% - 280px)', minHeight: '300px' }}>
        <GeofencingMap
          geofences={[]}
          selectedGeofenceId={null}
          onSelectGeofence={() => {}}
          editMode={true}
          onGeometryChange={handleGeometryChange}
        />
      </Box>
    </Box>
  );
}