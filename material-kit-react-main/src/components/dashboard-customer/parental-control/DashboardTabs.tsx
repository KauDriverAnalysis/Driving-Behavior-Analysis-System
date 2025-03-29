import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

interface DashboardTabsProps {
  tabValue: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ tabValue, handleTabChange }) => {
  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      width: '100%'
    }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        aria-label="dashboard tabs"
        variant="fullWidth"
      >
        <Tab label="Overview" />
        <Tab label="Emergency Contacts" />
        <Tab label="Alerts" />
        <Tab label="Pattern Score" />
      </Tabs>
    </Box>
  );
};

export default DashboardTabs;