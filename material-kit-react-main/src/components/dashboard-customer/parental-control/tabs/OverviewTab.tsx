import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import StatCard from '../cards/StatCard';
import DrivingScoreChart from '../charts/DrivingScoreChart';
import DrivingMetricsChart from '../charts/DrivingMetricsChart';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Mock data will be imported from a separate file in the full implementation
import { drivingHistoryData } from '../data/mockData';

// Add interface for component props
interface OverviewTabProps {
  selectedCar: string;
}

// Update component to receive selectedCar prop
const OverviewTab: React.FC<OverviewTabProps> = ({ selectedCar }) => {
  // Add state for car data
  const [carData, setCarData] = useState(drivingHistoryData);
  
  // Add effect to fetch data when selectedCar changes
  useEffect(() => {
    // In a real implementation, you would fetch data for the selected car
    console.log(`Fetching overview data for car: ${selectedCar}`);
    
    // Example API call (commented out)
    // if (selectedCar) {
    //   fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${selectedCar}/`)
    //     .then(response => response.json())
    //     .then(data => {
    //       // Transform API data to match component needs
    //       setCarData(data);
    //     })
    //     .catch(error => console.error('Error fetching car overview data:', error));
    // }
  }, [selectedCar]);

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
      <DrivingScoreChart data={carData} />
      <DrivingMetricsChart data={carData} />
    </Box>
  );
};

export default OverviewTab;