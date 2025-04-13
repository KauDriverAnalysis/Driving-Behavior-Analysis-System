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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update useEffect to fetch data based on car selection
  useEffect(() => {
    const fetchDrivingData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let endpoint;
        let dataFormatter;
        
        if (selectedCar && selectedCar !== 'all') {
          // Fetch data for a specific car
          endpoint = `https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${selectedCar}/`;
          dataFormatter = processSingleCarData;
        } else {
          // Fetch aggregate data for all customer's cars
          const customerId = localStorage.getItem('customerId') || 
                           localStorage.getItem('customer-id') || 
                           localStorage.getItem('customer_id') ||
                           localStorage.getItem('userId');
          
          endpoint = `https://driving-behavior-analysis-system.onrender.com/api/fleet-overview/?customer_id=${customerId}&time_frame=7d`;
          dataFormatter = processFleetData;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        const processedData = dataFormatter(data);
        
        setMetricsData(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching driving data:', error);
        setError('Failed to load driving data');
        setLoading(false);
      }
    };
    
    // Data processing functions
    const processSingleCarData = (data) => {
      const { summary, history = [] } = data;
      
      // Process historical data if available
      if (history.length > 0) {
        return history.map(record => ({
          date: new Date(record.created_at).toISOString().split('T')[0],
          harshBraking: record.harsh_braking_events || 0,
          hardAcceleration: record.harsh_acceleration_events || 0,
          swerving: record.swerving_events || 0,
          overSpeed: record.over_speed_events || 0,
          score: record.score || 0
        }));
      }
      
      // Fallback to summary data
      return [{
        date: new Date().toISOString().split('T')[0],
        harshBraking: summary?.total_harsh_braking || 0,
        hardAcceleration: summary?.total_harsh_acceleration || 0,
        swerving: summary?.total_swerving || 0,
        overSpeed: summary?.total_over_speed || 0,
        score: summary?.avg_score || 0
      }];
    };
    
    const processFleetData = (data) => {
      const events = data.events || {};
      const fleetStats = data.fleet_stats || {};
      const historicalScores = data.historical_scores || [];
      
      if (historicalScores.length > 0) {
        return historicalScores.map(item => ({
          date: item.date || item.time_label,
          harshBraking: events.harsh_braking || 0,
          hardAcceleration: events.harsh_acceleration || 0,
          swerving: events.swerving || 0,
          overSpeed: events.over_speed || 0,
          score: item.score || 0
        }));
      }
      
      return [{
        date: new Date().toISOString().split('T')[0],
        harshBraking: events.harsh_braking || 0,
        hardAcceleration: events.harsh_acceleration || 0,
        swerving: events.swerving || 0,
        overSpeed: events.over_speed || 0,
        score: fleetStats.avg_score || 0
      }];
    };
    
    fetchDrivingData();
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