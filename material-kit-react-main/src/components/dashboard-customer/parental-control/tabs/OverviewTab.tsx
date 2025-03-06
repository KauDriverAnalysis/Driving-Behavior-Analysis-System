import React from 'react';
import { Box, Grid } from '@mui/material';
import StatCard from '../cards/StatCard';
import DrivingScoreChart from '../charts/DrivingScoreChart';
import DrivingMetricsChart from '../charts/DrivingMetricsChart';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Mock data will be imported from a separate file in the full implementation
import { drivingHistoryData } from '../data/mockData';

const OverviewTab: React.FC = () => {
  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Safety Score"
            value="82/100"
            subtitle="↓ 4% from last week"
            icon={<ShieldIcon />}
            iconColor="primary.main"
            iconBgColor="primary.light"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Top Speed"
            value="72 mph"
            subtitle="Highway 101 on Wednesday"
            icon={<WarningIcon />}
            iconColor="#F44336"
            iconBgColor="#FFEBEE"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Recent Alerts"
            value="4"
            subtitle="Past 48 hours"
            icon={<NotificationsIcon />}
            iconColor="#FF9800"
            iconBgColor="#FFF8E1"
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <DrivingScoreChart data={drivingHistoryData} />
      <DrivingMetricsChart data={drivingHistoryData} />
    </Box>
  );
};

export default OverviewTab;