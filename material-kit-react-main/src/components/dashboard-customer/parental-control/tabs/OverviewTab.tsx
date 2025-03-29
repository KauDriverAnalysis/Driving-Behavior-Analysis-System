import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import StatCard from '../cards/StatCard';
import DrivingScoreChart from '../charts/DrivingScoreChart';
import DrivingMetricsChart from '../charts/DrivingMetricsChart';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Import mock data
import { drivingHistoryData } from '../data/mockData';

// Import the interface from the chart component to ensure type consistency
import type { DrivingMetricsData } from '../charts/DrivingMetricsChart';

// Add interface for component props
interface OverviewTabProps {
  selectedCar: string;
}

// Transform the mock data to match what the charts expect
const transformToMetricsData = (rawData: any): DrivingMetricsData[] => {
  // If rawData is not an array, make it one with a single item
  const dataArray = Array.isArray(rawData) ? rawData : [rawData];
  
  // Map the data to the expected format
  return dataArray.map(item => ({
    date: item.date || new Date().toISOString().split('T')[0], // Default to today if missing
    harshBraking: Number(item.harsh_braking || 0),
    hardAcceleration: Number(item.hard_acceleration || 0),
    swerving: Number(item.swerving || 0),
    overSpeed: Number(item.over_speed || 0)
  }));
};

// Update component to receive selectedCar prop
const OverviewTab: React.FC<OverviewTabProps> = ({ selectedCar }) => {
  // Add state for raw car data
  const [rawData, setRawData] = useState(drivingHistoryData);
  // Add state for transformed metrics data
  const [metricsData, setMetricsData] = useState<DrivingMetricsData[]>(() => 
    transformToMetricsData(drivingHistoryData)
  );
  
  // Add effect to fetch data when selectedCar changes
  useEffect(() => {
    // Log the car ID for debugging
    console.log(`Fetching overview data for car: ${selectedCar}`);
    
    // Example of how you would fetch and transform real data
    if (selectedCar && selectedCar !== 'all') {
      // This is just for the mock data - you'll replace with real API call
      // For now, simulate by using the mock data
      setRawData(drivingHistoryData);
      // Transform the data to match expected format
      const transformedData = transformToMetricsData(drivingHistoryData);
      setMetricsData(transformedData);
      
      // When you implement the real API call, it would look like:
      /*
      fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${selectedCar}/`)
        .then(response => response.json())
        .then(data => {
          setRawData(data);
          setMetricsData(transformToMetricsData(data));
        })
        .catch(error => console.error('Error fetching car overview data:', error));
      */
    }
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
      
      {/* Charts - pass the correctly transformed data */}
      <DrivingScoreChart data={rawData} />
      <DrivingMetricsChart data={metricsData} />
    </Box>
  );
};

export default OverviewTab;