import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import WarningIcon from '@mui/icons-material/Warning';
import { useNotifications } from '@/contexts/notifications-context';

export function NotificationsPopover(): React.JSX.Element {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { alerts, unreadCount, loading, markAllAsRead, markAsRead, fetchAlerts } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Refresh alerts when opening the popover
    fetchAlerts();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Format timestamp to display exact time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    // Always show actual time for events from today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // For older events
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Get icon for alert type - UPDATED to match AlertsTab component
  const getAlertIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'speeding':
        return <SpeedIcon fontSize="small" />;
      case 'harsh_braking':
        return <TrendingDownIcon fontSize="small" />;
      case 'harsh_acceleration':
        return <TrendingUpIcon fontSize="small" />;
      case 'swerving':
        return <CompareArrowsIcon fontSize="small" />; // Updated to match AlertsTab
      case 'geofence':
        return <GpsOffIcon fontSize="small" />; // Added specific handler
      case 'accident':
        return <WarningIcon fontSize="small" />; // Added specific handler
      default:
        return <NotificationsNoneIcon fontSize="small" />; // Changed default icon
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

  const handleClickNotification = (id: string) => {
    markAsRead(id);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          sx={{
            color: 'primary.main',
            '&:hover': { bgcolor: 'primary.light' }
          }}
          size="small"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>Mark all as read</Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : alerts.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {alerts.map((alert) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    bgcolor: alert.isRead ? 'transparent' : 'action.hover',
                    py: 1.5,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleClickNotification(alert.id)}
                >
                  <Avatar
                    sx={{
                      bgcolor: getAlertColor(alert.severity),
                      mr: 2,
                      width: 38,
                      height: 38
                    }}
                  >
                    {getAlertIcon(alert.type)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" noWrap>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {alert.carInfo.model} ({alert.carInfo.plateNumber}) • {formatTimestamp(alert.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {alerts.length > 0 && (
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button 
              size="small" 
              href="/dashboard-customer/parental-control"
              onClick={handleClose}
            >
              View All
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
}