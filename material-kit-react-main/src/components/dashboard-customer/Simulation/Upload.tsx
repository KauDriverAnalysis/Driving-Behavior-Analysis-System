'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

interface SimulationUploadProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
  acceptedFile: File | null;
}

export function SimulationUpload({ onFileUpload, loading, acceptedFile }: SimulationUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        onFileUpload(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        sx={{
          border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: dragActive ? 'primary.50' : 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-upload')?.click()}
      >
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={loading}
        />
        
        <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {acceptedFile ? 'File Ready for Analysis' : 'Upload Your Driving Data'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {acceptedFile 
            ? `Selected: ${acceptedFile.name}`
            : 'Drag and drop your CSV file here, or click to browse'
          }
        </Typography>
        
        {!acceptedFile && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
          >
            Choose CSV File
          </Button>
        )}
      </Paper>

      {/* File Requirements */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          CSV File Requirements:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Headers: Time, Latitude, Longitude, Speed(km/h), Ax, Ay, Az, Gx, Gy, Gz" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Format: Standard CSV with comma separation" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Size: Maximum 50MB file size" />
          </ListItem>
        </List>
      </Alert>

      {/* Sample Format */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1, fontSize: 18 }} />
          Sample CSV Format:
        </Typography>
        <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`Time,Latitude,Longitude,Speed(km/h),Ax,Ay,Az,Gx,Gy,Gz
2024-01-01 10:00:00,21.4858,39.1925,45.2,0.1,-0.2,9.8,0.01,0.02,-0.01
2024-01-01 10:00:01,21.4859,39.1926,46.1,0.2,-0.1,9.9,0.02,0.01,-0.02`}
        </Typography>
      </Paper>
    </Box>
  );
}
