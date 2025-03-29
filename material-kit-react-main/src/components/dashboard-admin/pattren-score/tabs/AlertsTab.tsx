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
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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

function AlertsTab(): React.JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertSettings, setAlertSettings] = useState({
    harshBraking: true,
    hardAcceleration: true,
    swerving: true,
    overSpeed: true,
    geofence: true
  });

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
            // Create a synthetic record ID for alerts
            const recordId = new Date().getTime();
            
            // Check for speeding > 120km/h
            if (record.speed > 120) {
              allAlerts.push({
                id: `speed-${car.id}-${recordId}`,
                type: 'speeding',
                message: `Vehicle exceeded speed limit: ${Math.round(record.speed)} km/h`,
                severity: 'error',
                isRead: false,
                timestamp: new Date().toISOString(),
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
            
            // Check for harsh braking events > 25
            if (record.harsh_braking_events > 25) {
              allAlerts.push({
                id: `brake-${car.id}-${recordId}`,
                type: 'harsh_braking',
                message: `Excessive harsh braking detected: ${record.harsh_braking_events} events`,
                severity: 'warning',
                isRead: false,
                timestamp: new Date().toISOString(),
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
            
            // Check for harsh acceleration > 25
            if (record.harsh_acceleration_events > 25) {
              allAlerts.push({
                id: `accel-${car.id}-${recordId}`,
                type: 'harsh_acceleration',
                message: `Excessive harsh acceleration detected: ${record.harsh_acceleration_events} events`,
                severity: 'warning',
                isRead: false,
                timestamp: new Date().toISOString(),
                carInfo: {
                  id: car.id,
                  model: car.Model_of_car || car.model || 'Unknown Model',
                  plateNumber: car.Plate_number || car.plateNumber || 'Unknown'
                }
              });
            }
            
            // Check for swerving > 25
            if (record.swerving_events > 25) {
              allAlerts.push({
                id: `swerve-${car.id}-${recordId}`,
                type: 'swerving',
                message: `Excessive swerving detected: ${record.swerving_events} events`,
                severity: 'warning',
                isRead: false,
                timestamp: new Date().toISOString(),
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
        
        // Sort alerts by timestamp (newest first)
        allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setAlerts(allAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load alerts');
        setLoading(false);
      }
    };

    void fetchAlerts(); // Use void operator to handle the Promise
  }, []);
  
  // Handle alert setting toggling
  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAlertSettings({
      ...alertSettings,
      [setting]: event.target.checked
    });
  };

  // Filter alerts based on search term
  const filteredAlerts = alerts.filter(alert => {
    const searchLower = searchTerm.toLowerCase();
    return alert.message.toLowerCase().includes(searchLower) || 
           alert.carInfo.model.toLowerCase().includes(searchLower) || 
           alert.carInfo.plateNumber.toLowerCase().includes(searchLower) ||
           alert.type.toLowerCase().includes(searchLower);
  });

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
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
  const getAlertIcon = (type: string): React.ReactNode => {
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