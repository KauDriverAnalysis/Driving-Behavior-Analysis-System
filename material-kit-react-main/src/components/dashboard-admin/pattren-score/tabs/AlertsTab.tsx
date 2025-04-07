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
  CircularProgress, 
  TextField,
  InputAdornment
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
// Import better icons for alerts
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'; // For acceleration
import FlightLandIcon from '@mui/icons-material/FlightLand'; // For braking
import AltRouteIcon from '@mui/icons-material/AltRoute'; // For swerving
import LocationOffIcon from '@mui/icons-material/LocationOff'; // For geofence
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert'; // For accidents
import SearchIcon from '@mui/icons-material/Search';
import type { Alert } from '@/types/alert';

interface Car {
  id: string;
  Model_of_car?: string;
  model?: string;
  Plate_number?: string;
  plateNumber?: string;
}

interface CarData {
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

interface AlertSettings {
  harshBraking: boolean;
  hardAcceleration: boolean;
  swerving: boolean;
  overSpeed: boolean;
  geofence: boolean;
}

const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  harshBraking: true,
  hardAcceleration: true,
  swerving: true,
  overSpeed: true,
  geofence: true
};

function AlertsTab(): React.JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(DEFAULT_ALERT_SETTINGS);

  // Load alert settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminAlertSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAlertSettings({...DEFAULT_ALERT_SETTINGS, ...parsedSettings});
      } catch (e) {
        console.error('Failed to parse alert settings:', e);
      }
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Get company ID from localStorage with multiple fallbacks
        const companyId = localStorage.getItem('company_id') || 
                         localStorage.getItem('companyId') ||
                         localStorage.getItem('userId') ||
                         localStorage.getItem('employee-company-id');
                      
        if (!companyId) {
          throw new Error('No company ID found');
        }
        
        // Get all cars for this company
        const carsResponse = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=company&userId=${companyId}`);
        
        if (!carsResponse.ok) {
          throw new Error(`Failed to fetch cars: ${carsResponse.status} ${carsResponse.statusText}`);
        }
        
        const cars = await carsResponse.json() as Car[];
        
        if (!Array.isArray(cars) || cars.length === 0) {
          setAlerts([]);
          setLoading(false);
          return;
        }
        
        // Collect alerts for all company's cars
        const allAlerts: Alert[] = [];
        
        for (const car of cars) {
          try {
            // Fetch driving data for this car
            const dataResponse = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${car.id}/`);
            
            if (!dataResponse.ok) {
              continue;
            }
            
            const carData = await dataResponse.json() as CarData;
            
            // Check if car data and current data exists
            if (!carData?.current) continue;
            
            // Process current data - this contains the latest metrics
            const record = carData.current;
            
            // Get the ACTUAL timestamp from the record
            // If created_at doesn't exist, then fallback to current time
            const recordTimestamp = record.created_at ? new Date(record.created_at).toISOString() : new Date().toISOString();
            
            // Check for speeding > 120km/h
            if (record.speed > 120 && alertSettings.overSpeed) {
              allAlerts.push({
                id: `speed-${car.id}-${Date.now()}`,
                type: 'speeding',
                message: `Vehicle exceeded speed limit: ${Math.round(record.speed)} km/h`,
                severity: 'error',
                isRead: false,
                timestamp: recordTimestamp, // Use actual record timestamp
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
            
            // Check for harsh braking events > 25
            if (record.harsh_braking_events > 25 && alertSettings.harshBraking) {
              allAlerts.push({
                id: `brake-${car.id}-${Date.now()}`,
                type: 'harsh_braking',
                message: `Excessive harsh braking detected: ${record.harsh_braking_events} events`,
                severity: 'warning',
                isRead: false,
                timestamp: recordTimestamp, // Use actual record timestamp
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
            
            // Check for harsh acceleration > 25
            if (record.harsh_acceleration_events > 25 && alertSettings.hardAcceleration) {
              allAlerts.push({
                id: `accel-${car.id}-${Date.now()}`,
                type: 'harsh_acceleration',
                message: `Excessive harsh acceleration detected: ${record.harsh_acceleration_events} events`,
                severity: 'warning',
                isRead: false,
                timestamp: recordTimestamp, // Use actual record timestamp
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
            
            // Check for swerving > 25
            if (record.swerving_events > 25 && alertSettings.swerving) {
              allAlerts.push({
                id: `swerve-${car.id}-${Date.now()}`,
                type: 'swerving',
                message: `Excessive swerving detected: ${record.swerving_events} events`,
                severity: 'warning',
                isRead: false,
                timestamp: recordTimestamp, // Use actual record timestamp
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
          } catch (carError) {
            // Error handled silently for individual cars
          }
        }
        
        // Filter alerts by time-to-live (24 hours from their ACTUAL recorded time)
        const now = new Date().getTime();
        const filteredAlerts = allAlerts.filter(alert => {
          const alertTime = new Date(alert.timestamp).getTime();
          return (now - alertTime) < 14 * 24 * 60 * 60 * 1000; // Extend to 14 days to see older data if needed
        });
        
        // Sort alerts by timestamp (newest first)
        filteredAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setAlerts(filteredAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load alerts');
        setLoading(false);
      }
    };

    void fetchAlerts(); // Use void operator to handle the Promise
  }, [alertSettings]);
  
  // Handle alert setting toggling
  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newSettings = {
      ...alertSettings,
      [setting]: event.target.checked
    };
    
    setAlertSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('adminAlertSettings', JSON.stringify(newSettings));
  };

  // Filter alerts based on search term
  const filteredAlerts = alerts.filter(alert => {
    const searchLower = searchTerm.toLowerCase();
    return alert.message.toLowerCase().includes(searchLower) || 
           alert.carInfo.model.toLowerCase().includes(searchLower) || 
           alert.carInfo.plateNumber.toLowerCase().includes(searchLower) ||
           alert.type.toLowerCase().includes(searchLower);
  });

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
        return <SpeedIcon />; // Keep the speed icon as it's good
      case 'harsh_braking':
        return <FlightLandIcon style={{ transform: 'rotate(45deg)' }} />; // Better braking icon
      case 'harsh_acceleration':
        return <FlightTakeoffIcon style={{ transform: 'rotate(45deg)' }} />; // Better acceleration icon
      case 'swerving':
        return <AltRouteIcon />; // Better swerving icon
      case 'geofence':
        return <LocationOffIcon />; // For geofence alerts
      case 'accident':
        return <CrisisAlertIcon />; // For accident detection
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
      {/* Add search box for alerts */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search alerts by vehicle, type, or message..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3, 
        mb: 3,
        minHeight: { xs: 'auto', md: '400px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Fleet Alerts</Typography>
        
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
        
        {!loading && !error && filteredAlerts.length === 0 && (
          <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            {searchTerm ? 'No alerts match your search criteria.' : 'No alerts found. All vehicles operating within normal parameters.'}
          </Typography>
        )}
        
        {!loading && !error && filteredAlerts.length > 0 && (
          <List>
            {filteredAlerts.map(alert => (
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
      
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        minHeight: { xs: 'auto', md: '300px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Company Alert Settings</Typography>
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