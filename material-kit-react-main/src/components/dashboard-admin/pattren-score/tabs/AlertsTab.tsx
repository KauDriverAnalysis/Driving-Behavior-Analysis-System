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
  InputAdornment,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Alert as MuiAlert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Modern alert icons - More contemporary choices
import ShieldIcon from '@mui/icons-material/Shield';
// Import better driving behavior analysis related icons
import BrakingIcon from '@mui/icons-material/NoStroller'; // Braking (emergency stop)
import SpeedIcon from '@mui/icons-material/Speed'; // Speed-related
import TireRepairIcon from '@mui/icons-material/TireRepair'; // Swerving/tire tracks
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; // General car
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'; // Authority/rules
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'; // Acceleration
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import ReportIcon from '@mui/icons-material/Report';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // For acceleration
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // For braking
import TimerIcon from '@mui/icons-material/Timer'; // For speed limits
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import WarningIcon from '@mui/icons-material/Warning';
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
    created_at?: string;
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
  const [unreadCount, setUnreadCount] = useState<number>(0);

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
        
        // Fetch all cars for this company
        const carsResp = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=company&userId=${companyId}`);
        const cars = await carsResp.json();

        // --- Fetch geofence alerts from get-car-location ---
        const geoResp = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/get-car-location/?userType=company&userId=${companyId}`);
        const geoData = await geoResp.json();
        const geofenceAlerts = geoData
          .filter((car: any) => car.geofence_alert)
          .map((car: any) => ({
            id: `geofence-${car.id}`,
            type: 'geofence',
            message: car.geofence_alert.message,
            severity: car.geofence_alert.severity || 'warning',
            isRead: false,
            timestamp: new Date().toISOString(),
            carInfo: {
              id: car.id,
              model: car.model,
              plateNumber: car.plate
            }
          }));

        // Collect alerts for all company's cars
        const allAlerts: Alert[] = [];

        allAlerts.push(...geofenceAlerts);

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
        // Count unread alerts
        setUnreadCount(filteredAlerts.filter(alert => !alert.isRead).length);
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

  // Mark an alert as read
  const markAsRead = (alertId: string): void => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
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
    
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    
    // Show relative time for recent events
    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // For older events
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get icon for alert type with improved relevant icons
  const getAlertIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'speeding':
        return <SpeedIcon />; // Speedometer icon (already good)
      case 'harsh_braking':
        return <TrendingDownIcon />; // Downward trend - perfect for braking
      case 'harsh_acceleration':
        return <TrendingUpIcon />; // Upward trend - perfect for acceleration
      case 'swerving':
        return <CompareArrowsIcon />; // Sideways arrows - good for lateral movement
      case 'geofence':
        return <LocationOffIcon />; // Location boundary exit
      case 'accident':
        return <WarningIcon />; // Warning triangle - universal accident symbol
      default:
        return <NotificationsNoneIcon />;
    }
  };
  
  // Get color for alert severity
  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'error':
        return '#f44336'; // Red
      case 'warning':
        return '#ff9800'; // Orange
      default:
        return '#2196f3'; // Blue
    }
  };

  // Get background color for alert severity (lighter version)
  const getAlertBgColor = (severity: string): string => {
    switch (severity) {
      case 'error':
        return 'rgba(244, 67, 54, 0.08)';
      case 'warning':
        return 'rgba(255, 152, 0, 0.08)';
      default:
        return 'rgba(33, 150, 243, 0.08)';
    }
  };

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      {/* Header with search and badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
          <ShieldIcon sx={{ mr: 1, fontSize: 28 }} />
          Fleet Alerts
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              sx={{ ml: 2 }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <NotificationsActiveIcon color="action" />
            </Badge>
          )}
        </Typography>
        
        <TextField
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ 
            width: { xs: '50%', md: '300px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2, 
        mb: 3,
        minHeight: { xs: 'auto', md: '400px' },
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }} elevation={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : null}
        
        {!loading && error ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            my: 4, 
            p: 3, 
            bgcolor: 'rgba(244, 67, 54, 0.08)', 
            borderRadius: 2 
          }}>
            <Typography color="error" sx={{ display: 'flex', alignItems: 'center' }}>
              <ReportIcon sx={{ mr: 1 }} />
              {error}
            </Typography>
          </Box>
        ) : null}
        
        {!loading && !error && filteredAlerts.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            my: 8, 
            color: 'text.secondary' 
          }}>
            <CheckCircleIcon sx={{ fontSize: 60, mb: 2, color: 'success.main', opacity: 0.8 }} />
            <Typography variant="h6">
              {searchTerm ? 'No alerts match your search criteria.' : 'All systems normal'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchTerm ? 'Try adjusting your search terms.' : 'All vehicles operating within normal parameters.'}
            </Typography>
          </Box>
        )}
        
        {!loading && !error && filteredAlerts.length > 0 && (
          <List sx={{ p: 0 }}>
            {filteredAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem 
                  sx={{ 
                    p: 2,
                    borderRadius: 2, 
                    mb: 1,
                    bgcolor: alert.isRead ? 'transparent' : getAlertBgColor(alert.severity),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: getAlertBgColor(alert.severity),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    },
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: getAlertColor(alert.severity),
                      color: 'white',
                      width: 44,
                      height: 44
                    }}>
                      {getAlertIcon(alert.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography fontWeight="600">
                            {alert.type.replace('_', ' ').charAt(0).toUpperCase() + alert.type.replace('_', ' ').slice(1)} Alert
                          </Typography>
                          {!alert.isRead && (
                            <Chip 
                              label="NEW" 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: getAlertColor(alert.severity),
                                color: 'white'
                              }} 
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{formatTimestamp(alert.timestamp)}</Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 0.5, mb: 0.5 }}>{alert.message}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <ElectricCarIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {alert.carInfo.model} • {alert.carInfo.plateNumber}
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                  
                  <Tooltip title="Mark as read">
                    <IconButton 
                      size="small" 
                      onClick={() => markAsRead(alert.id)} 
                      sx={{ 
                        opacity: alert.isRead ? 0.3 : 1,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } 
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItem>
                {index < filteredAlerts.length - 1 && <Divider variant="inset" sx={{ ml: 7 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2,
        minHeight: { xs: 'auto', md: '300px' },
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }} elevation={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsNoneIcon sx={{ mr: 1 }} />
            Alert Settings
          </Typography>
          <Chip 
            icon={alertSettings.harshBraking || alertSettings.hardAcceleration || alertSettings.swerving || alertSettings.overSpeed || alertSettings.geofence ? 
              <NotificationsActiveIcon fontSize="small" /> : 
              <NotificationsOffIcon fontSize="small" />
            } 
            label={alertSettings.harshBraking || alertSettings.hardAcceleration || alertSettings.swerving || alertSettings.overSpeed || alertSettings.geofence ? 
              "Notifications Active" : 
              "All Notifications Off"
            }
            color={alertSettings.harshBraking || alertSettings.hardAcceleration || alertSettings.swerving || alertSettings.overSpeed || alertSettings.geofence ? 
              "primary" : 
              "default"
            }
            variant="outlined"
            size="small"
          />
        </Box>
        
        <List sx={{ p: 0 }}>
          <AlertSettingItem 
            title="Harsh Braking" 
            description="Notify when harsh braking events are detected" 
            checked={alertSettings.harshBraking}
            onChange={handleSettingChange('harshBraking')}
            icon={<TrendingDownIcon />} // Updated from previous icon
          />
          <AlertSettingItem 
            title="Hard Acceleration" 
            description="Notify when aggressive acceleration is detected" 
            checked={alertSettings.hardAcceleration}
            onChange={handleSettingChange('hardAcceleration')}
            icon={<TrendingUpIcon />} // Updated from previous icon
          />
          <AlertSettingItem 
            title="Swerving" 
            description="Notify when sudden lane changes or swerving occurs" 
            checked={alertSettings.swerving}
            onChange={handleSettingChange('swerving')}
            icon={<CompareArrowsIcon />} // Updated from OpenInFullIcon
          />
          <AlertSettingItem 
            title="Speed Limit" 
            description="Notify when vehicle exceeds speed limits" 
            checked={alertSettings.overSpeed}
            onChange={handleSettingChange('overSpeed')}
            icon={<TimerIcon />}
          />
          <AlertSettingItem 
            title="Geofence Boundary" 
            description="Notify when vehicle leaves designated area" 
            checked={alertSettings.geofence}
            onChange={handleSettingChange('geofence')}
            icon={<GpsOffIcon />}
          />
        </List>
      </Paper>
    </Box>
  );
}

// Alert Setting Item Component with improved design
interface AlertSettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}

function AlertSettingItem({ title, description, checked, onChange, icon }: AlertSettingItemProps): React.JSX.Element {
  return (
    <ListItem 
      sx={{ 
        p: 2,
        borderRadius: 2, 
        mb: 1.5,
        bgcolor: 'background.default',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.02)',
        },
      }}
      secondaryAction={
        <Switch 
          checked={checked} 
          onChange={onChange} 
          edge="end" 
          color="primary"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#3f51b5',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#3f51b5',
            },
          }}
        />
      }
    >
      <ListItemIcon>
        <Avatar 
          sx={{ 
            bgcolor: checked ? 'rgba(63, 81, 181, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            color: checked ? '#3f51b5' : 'text.secondary',
            width: 36,
            height: 36
          }}
        >
          {icon}
        </Avatar>
      </ListItemIcon>
      <ListItemText 
        primary={<Typography fontWeight="500">{title}</Typography>}
        secondary={description}
        sx={{
          '& .MuiTypography-root': {
            color: checked ? 'text.primary' : 'text.secondary',
          }
        }}
      />
    </ListItem>
  );
}

export default AlertsTab;