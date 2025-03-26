import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Switch, CircularProgress, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Alert } from '@/types/alert';

// Add props interface
interface AlertsTabProps {
  selectedCar: string;
  carDetails?: {
    model: string;
    plateNumber: string;
  };
}

// Update component to accept props
const AlertsTab: React.FC<AlertsTabProps> = ({ selectedCar, carDetails }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState({
    harshBraking: true,
    hardAcceleration: true,
    swerving: true,
    overSpeed: true,
    geofence: true
  });

  // Fetch alerts for the selected car only
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!selectedCar || selectedCar === 'all') {
        setAlerts([]);
        setLoading(false);
        return; // Don't fetch if no car selected or "all" is selected
      }
      
      try {
        setLoading(true);
        setAlerts([]); // Clear previous alerts
        
        // Fetch driving data only for the selected car
        const dataResponse = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${selectedCar}/`);
        const carData = await dataResponse.json();
        
        console.log(`Selected car ${selectedCar} data:`, carData);
        
        const allAlerts: Alert[] = [];
        
        // Check the current data for this car
        if (carData && carData.current) {
          const record = carData.current;
          const recordId = new Date().getTime();
          
          // Use carDetails from props if available
          const carModel = carDetails?.model || 'Unknown';
          const carPlateNumber = carDetails?.plateNumber || 'Unknown';
          
          // Check for speeding > 120km/h
          if (record.speed > 120) {
            allAlerts.push({
              id: `speed-${selectedCar}-${recordId}`,
              type: 'speeding',
              message: `Vehicle exceeded speed limit: ${Math.round(record.speed)} km/h`,
              severity: 'error',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for harsh braking events > 25
          if (record.harsh_braking_events > 25) {
            allAlerts.push({
              id: `brake-${selectedCar}-${recordId}`,
              type: 'harsh_braking',
              message: `Excessive harsh braking detected: ${record.harsh_braking_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for harsh acceleration > 25
          if (record.harsh_acceleration_events > 25) {
            allAlerts.push({
              id: `accel-${selectedCar}-${recordId}`,
              type: 'harsh_acceleration',
              message: `Excessive harsh acceleration detected: ${record.harsh_acceleration_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for swerving > 25
          if (record.swerving_events > 25) {
            allAlerts.push({
              id: `swerve-${selectedCar}-${recordId}`,
              type: 'swerving',
              message: `Excessive swerving detected: ${record.swerving_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for possible accident
          if (record.accident_detected) {
            allAlerts.push({
              id: `accident-${selectedCar}-${recordId}`,
              type: 'accident',
              message: `Possible accident detected! Emergency services may be needed.`,
              severity: 'error',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              },
              location: record.latitude && record.longitude ? {
                lat: record.latitude,
                lng: record.longitude
              } : undefined
            });
          }
        }
        
        setAlerts(allAlerts);
        setLoading(false);
        if (allAlerts.length === 0) {
          console.log("No alerts found for selected car");
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [selectedCar, carDetails]);
  
  // Handle alert setting toggling
  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlertSettings({
      ...alertSettings,
      [setting]: event.target.checked
    });
  };
  
  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };
  
  // Get icon for alert type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'speeding':
        return <SpeedIcon />;
      case 'harsh_braking':
        return <TrendingDownIcon />;
      case 'harsh_acceleration':
        return <TrendingUpIcon />;
      case 'swerving':
        return <NotListedLocationIcon />;
      default:
        return <WarningIcon />;
    }
  };
  
  // Get color for alert severity
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      default:
        return 'info.main';
    }
  };

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      {/* Recent Alerts Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3, 
        mb: 3,
        minHeight: { xs: 'auto', md: '400px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Recent Alerts</Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && error && (
          <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
            {error}
          </Typography>
        )}
        
        {!loading && !error && alerts.length === 0 && (
          <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            No alerts found. Drive safely!
          </Typography>
        )}
        
        {!loading && !error && alerts.length > 0 && (
          <List>
            {alerts.map(alert => (
              <ListItem 
                key={alert.id}
                sx={{ 
                  borderRadius: 2, 
                  mb: 1,
                  borderLeft: 4,
                  borderColor: getAlertColor(alert.severity),
                  bgcolor: `${getAlertColor(alert.severity)}10`,
                }}
              >
                <ListItemIcon>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    bgcolor: getAlertColor(alert.severity),
                    color: 'white'
                  }}>
                    {getAlertIcon(alert.type)}
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight="medium">{alert.type.replace('_', ' ').toUpperCase()} Alert</Typography>
                      <Typography variant="body2" color="text.secondary">{formatTimestamp(alert.timestamp)}</Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">{alert.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.carInfo.model} ({alert.carInfo.plateNumber})
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Alert Settings Section */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        minHeight: { xs: 'auto', md: '300px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Alert Settings</Typography>
        <AlertSettingItem 
          title="Harsh Braking" 
          description="Notify when harsh braking events are detected" 
          checked={alertSettings.harshBraking}
          onChange={handleSettingChange('harshBraking')}
        />
        <AlertSettingItem 
          title="Hard Acceleration" 
          description="Notify when aggressive acceleration is detected" 
          checked={alertSettings.hardAcceleration}
          onChange={handleSettingChange('hardAcceleration')}
        />
        <AlertSettingItem 
          title="Swerving" 
          description="Notify when sudden lane changes or swerving occurs" 
          checked={alertSettings.swerving}
          onChange={handleSettingChange('swerving')}
        />
        <AlertSettingItem 
          title="Over Speed" 
          description="Notify when vehicle exceeds speed limits" 
          checked={alertSettings.overSpeed}
          onChange={handleSettingChange('overSpeed')}
        />
        <AlertSettingItem 
          title="Geofence Boundary" 
          description="Notify when vehicle leaves designated area" 
          checked={alertSettings.geofence}
          onChange={handleSettingChange('geofence')}
        />
      </Paper>
    </Box>
  );
};

// Alert Setting Item Component
interface AlertSettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AlertSettingItem: React.FC<AlertSettingItemProps> = ({ title, description, checked, onChange }) => {
  return (
    <ListItem sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
      <ListItemText 
        primary={<Typography fontWeight="medium">{title}</Typography>}
        secondary={description}
      />
      <Switch checked={checked} onChange={onChange} edge="end" />
    </ListItem>
  );
};

export default AlertsTab;