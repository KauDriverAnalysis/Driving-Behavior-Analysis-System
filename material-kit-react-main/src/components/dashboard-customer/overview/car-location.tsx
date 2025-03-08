// CarLocation.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dynamic from 'next/dynamic';

interface CarLocationProps {
  data: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
    address: string;
    status: string;
  };
}

export function CarLocation({ data }: CarLocationProps) {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Car Location
              </Typography>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Current location and status
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">{data.address}</Typography>
              </Box>
              
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {data.lastUpdated}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={data.status} 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box 
              sx={{ 
                height: 200, 
                width: '100%', 
                backgroundColor: 'action.hover',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Map view would be displayed here
              </Typography>
              {/* In a real implementation, this would be replaced with a map component */}
              {/* For example: <GoogleMap lat={data.latitude} lng={data.longitude} /> */}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}