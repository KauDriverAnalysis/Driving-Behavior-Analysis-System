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
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // For swerving
import LocationOffIcon from '@mui/icons-material/LocationOff'; // For geofence
import TimerIcon from '@mui/icons-material/Timer'; // For speed
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert'; // For accidents
import ElectricCarIcon from '@mui/icons-material/ElectricCar'; // For car details
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ShieldIcon from '@mui/icons-material/Shield'; // For safety header
import ReportIcon from '@mui/icons-material/Report'; // For error reporting
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
    created_at?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const { alertSettings, updateAlertSettings } = useNotifications();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

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
  }, [selectedCar, carDetails, alertSettings]);
  
  // Handle alert setting toggling
  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.checked;
    
    // Update local state for immediate UI feedback
    updateAlertSettings({
      [setting]: newValue
    });
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
        return <SpeedIcon />; // Speedometer icon
      case 'harsh_braking':
        return <TrendingDownIcon />; // Downward trend for braking
      case 'harsh_acceleration':
        return <TrendingUpIcon />; // Upward trend for acceleration
      case 'swerving':
        return <CompareArrowsIcon />; // Sideways arrows for lateral movement
      case 'geofence':
        return <LocationOffIcon />; // Location boundary exit
      case 'accident':
        return <WarningIcon />; // Warning triangle for accident
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
          Vehicle Alerts
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

      {/* Recent Alerts Section */}
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
              {searchTerm ? 'Try adjusting your search terms.' : 'Vehicle operating within safe parameters.'}
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
      
      {/* Alert Settings Section */}
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
            icon={<TrendingDownIcon />}
          />
          <AlertSettingItem 
            title="Hard Acceleration" 
            description="Notify when aggressive acceleration is detected" 
            checked={alertSettings.hardAcceleration}
            onChange={handleSettingChange('hardAcceleration')}
            icon={<TrendingUpIcon />}
          />
          <AlertSettingItem 
            title="Swerving" 
            description="Notify when sudden lane changes or swerving occurs" 
            checked={alertSettings.swerving}
            onChange={handleSettingChange('swerving')}
            icon={<CompareArrowsIcon />}
          />
          <AlertSettingItem 
            title="Over Speed" 
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
            icon={<LocationOffIcon />}
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