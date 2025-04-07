import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Switch, 
  CircularProgress 
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'; // For acceleration
import FlightLandIcon from '@mui/icons-material/FlightLand'; // For braking
import AltRouteIcon from '@mui/icons-material/AltRoute'; // For swerving
import LocationOffIcon from '@mui/icons-material/LocationOff'; // For geofence
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert'; // For accidents
import type { Alert } from '@/types/alert';
import { useNotifications } from '@/contexts/notifications-context';

// Interface for car driving data
interface CarDrivingData {
  current?: {
    speed: number;
    harsh_braking_events: number;
    harsh_acceleration_events: number;
    swerving_events: number;
    accident_detected: boolean;
    latitude?: number;
    longitude?: number;
  };
}

// Add props interface
interface AlertsTabProps {
  selectedCar: string;
  carDetails?: {
    model: string;
    plateNumber: string;
  };
}

// Update component to use function declaration
function AlertsTab({ selectedCar, carDetails }: AlertsTabProps): React.JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { alertSettings, updateAlertSettings } = useNotifications();

  // Fetch alerts for the selected car only
  useEffect(() => {
    const fetchAlerts = async (): Promise<void> => {
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
        const carData = await dataResponse.json() as CarDrivingData;
        
        const allAlerts: Alert[] = [];
        
        // Check the current data for this car
        if (carData?.current) {
          const record = carData.current;
          
          // Get the ACTUAL timestamp from the record
          // If created_at doesn't exist, then fallback to current time
          const recordTimestamp = record.created_at ? new Date(record.created_at).toISOString() : new Date().toISOString();
          
          const recordId = new Date().getTime();
          
          // Use carDetails from props if available
          const carModel = carDetails?.model || 'Unknown';
          const carPlateNumber = carDetails?.plateNumber || 'Unknown';
          
          // Check for speeding > 120km/h
          if (record.speed > 120 && alertSettings.overSpeed) {
            allAlerts.push({
              id: `speed-${selectedCar}-${recordId}`,
              type: 'speeding',
              message: `Vehicle exceeded speed limit: ${Math.round(record.speed)} km/h`,
              severity: 'error',
              isRead: false,
              timestamp: recordTimestamp, // Use actual record timestamp
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for harsh braking events > 25
          if (record.harsh_braking_events > 25 && alertSettings.harshBraking) {
            allAlerts.push({
              id: `brake-${selectedCar}-${recordId}`,
              type: 'harsh_braking',
              message: `Excessive harsh braking detected: ${record.harsh_braking_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: recordTimestamp, // Use actual record timestamp
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for harsh acceleration > 25
          if (record.harsh_acceleration_events > 25 && alertSettings.hardAcceleration) {
            allAlerts.push({
              id: `accel-${selectedCar}-${recordId}`,
              type: 'harsh_acceleration',
              message: `Excessive harsh acceleration detected: ${record.harsh_acceleration_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: recordTimestamp, // Use actual record timestamp
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for swerving > 25
          if (record.swerving_events > 25 && alertSettings.swerving) {
            allAlerts.push({
              id: `swerve-${selectedCar}-${recordId}`,
              type: 'swerving',
              message: `Excessive swerving detected: ${record.swerving_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: recordTimestamp, // Use actual record timestamp
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
              timestamp: recordTimestamp, // Use actual record timestamp
              carInfo: {
                id: selectedCar,
                model: carModel,
                plateNumber: carPlateNumber
              },
              location: record.latitude && record.longitude 
                ? {
                    lat: record.latitude,
                    lng: record.longitude
                  } 
                : undefined
            });
          }
        }
        
        // Filter alerts by time-to-live (extending to 14 days to see older data)
        const now = new Date().getTime();
        const filteredAlerts = allAlerts.filter(alert => {
          const alertTime = new Date(alert.timestamp).getTime();
          return (now - alertTime) < 14 * 24 * 60 * 60 * 1000;
        });
        
        setAlerts(filteredAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load alerts');
        setLoading(false);
      }
    };

    void fetchAlerts(); // Use void operator to handle the Promise
  }, [selectedCar, carDetails, alertSettings]);
  
  // Handle alert setting toggling
  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.checked;
    
    // Update local state for immediate UI feedback
    updateAlertSettings({
      [setting]: newValue
    });
  };
  
  // Format timestamp to display exact time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Always show actual time for events from today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // For older events
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get icon for alert type with improved icons
  const getAlertIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'speeding':
        return <SpeedIcon />;
      case 'harsh_braking':
        return <FlightLandIcon style={{ transform: 'rotate(45deg)' }} />;
      case 'harsh_acceleration':
        return <FlightTakeoffIcon style={{ transform: 'rotate(45deg)' }} />;
      case 'swerving':
        return <AltRouteIcon />;
      case 'accident':
        return <CrisisAlertIcon />;
      default:
        return <WarningIcon />;
    }
  };
  
  // Get color for alert severity
  const getAlertColor = (severity: string): string => {
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
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}
        
        {!loading && error ? (
          <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
            {error}
          </Typography>
        ) : null}
        
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
}

// Alert Setting Item Component
interface AlertSettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function AlertSettingItem({ title, description, checked, onChange }: AlertSettingItemProps): React.JSX.Element {
  return (
    <ListItem sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
      <ListItemText 
        primary={<Typography fontWeight="medium">{title}</Typography>}
        secondary={description}
      />
      <Switch checked={checked} onChange={onChange} edge="end" />
    </ListItem>
  );
}

export default AlertsTab;