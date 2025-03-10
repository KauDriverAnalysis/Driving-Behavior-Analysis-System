import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Switch } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { recentAlerts } from '../data/mockData';

const AlertsTab: React.FC = () => {
  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3, 
        mb: 3,
        minHeight: { xs: 'auto', md: '400px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Recent Alerts</Typography>
        <List>
          {recentAlerts.map(alert => (
            <ListItem 
              key={alert.id}
              sx={{ 
                borderRadius: 2, 
                mb: 1,
                borderLeft: 4,
                borderColor: 
                  alert.severity === 'error' ? 'error.main' : 
                  alert.severity === 'warning' ? 'warning.main' : 
                  'info.main',
                bgcolor: 
                  alert.severity === 'error' ? 'error.light' : 
                  alert.severity === 'warning' ? 'warning.light' : 
                  'info.light',
              }}
            >
              <ListItemIcon>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '50%', 
                  bgcolor: 
                    alert.severity === 'error' ? 'error.main' : 
                    alert.severity === 'warning' ? 'warning.main' : 
                    'info.main',
                  color: 'white'
                }}>
                  <WarningIcon fontSize="small" />
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="medium">{alert.type} Alert</Typography>
                    <Typography variant="body2" color="text.secondary">{alert.time}</Typography>
                  </Box>
                }
                secondary={alert.message}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        minHeight: { xs: 'auto', md: '300px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Alert Settings</Typography>
        <AlertSettingItem 
          title="Harsh Braking" 
          description="Notify when harsh braking events are detected" 
          defaultChecked={true} 
        />
        <AlertSettingItem 
          title="Hard Acceleration" 
          description="Notify when aggressive acceleration is detected" 
          defaultChecked={true} 
        />
        <AlertSettingItem 
          title="Swerving" 
          description="Notify when sudden lane changes or swerving occurs" 
          defaultChecked={true} 
        />
        <AlertSettingItem 
          title="Over Speed" 
          description="Notify when vehicle exceeds speed limits" 
          defaultChecked={true} 
        />
        <AlertSettingItem 
          title="Geofence Boundary" 
          description="Notify when vehicle leaves designated area" 
          defaultChecked={true} 
        />
      </Paper>
    </Box>
  );
};

interface AlertSettingItemProps {
  title: string;
  description: string;
  defaultChecked: boolean;
}

const AlertSettingItem: React.FC<AlertSettingItemProps> = ({ title, description, defaultChecked }) => {
  return (
    <ListItem sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
      <ListItemText 
        primary={<Typography fontWeight="medium">{title}</Typography>}
        secondary={description}
      />
      <Switch defaultChecked={defaultChecked} edge="end" />
    </ListItem>
  );
};

export default AlertsTab;