import React, { useEffect, useState } from 'react';
import { Box, Grid, CircularProgress, Alert } from '@mui/material';
import StatCard from '../cards/StatCard';
import DrivingScoreChart from '../charts/DrivingScoreChart';
import DrivingMetricsChart from '../charts/DrivingMetricsChart';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SpeedIcon from '@mui/icons-material/Speed';

// Import the interface from the chart component to ensure type consistency
import type { DrivingMetricsData } from '../charts/DrivingMetricsChart';

// Add interface for component props
interface OverviewTabProps {
  selectedCar: string;
}

function OverviewTab({ selectedCar }: OverviewTabProps): React.JSX.Element {
  const [metricsData, setMetricsData] = useState<DrivingMetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [safetyScore, setSafetyScore] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [distanceDriven, setDistanceDriven] = useState(0);

  // Fetch data when selectedCar changes
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
        
        // Set summary data
        if (selectedCar && selectedCar !== 'all') {
          setSafetyScore(data.summary?.avg_score || data.current?.score || 0);
          setDistanceDriven(data.summary?.total_distance || 0);
          // Calculate total events
          const totalEvents = (
            (data.summary?.total_harsh_braking || 0) +
            (data.summary?.total_harsh_acceleration || 0) +
            (data.summary?.total_swerving || 0) +
            (data.summary?.total_over_speed || 0)
          );
          setEventCount(totalEvents);
          // Use total events as alert count for now (could be refined)
          setAlertCount(totalEvents);
        } else {
          // For fleet data
          setSafetyScore(data.fleet_stats?.avg_score || 0);
          setDistanceDriven(data.fleet_stats?.total_distance_km || 0);
          const totalEvents = data.events?.total_events || 
                             ((data.events?.harsh_braking || 0) +
                             (data.events?.harsh_acceleration || 0) +
                             (data.events?.swerving || 0) +
                             (data.events?.over_speed || 0));
          setEventCount(totalEvents);
          setAlertCount(totalEvents);
        }
        
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
      const { summary, history = [], current } = data;
      
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
      
      // Fallback to summary or current data
      return [{
        date: new Date().toISOString().split('T')[0],
        harshBraking: summary?.total_harsh_braking || current?.harsh_braking_events || 0,
        hardAcceleration: summary?.total_harsh_acceleration || current?.harsh_acceleration_events || 0,
        swerving: summary?.total_swerving || current?.swerving_events || 0,
        overSpeed: summary?.total_over_speed || current?.over_speed_events || 0,
        score: summary?.avg_score || current?.score || 0
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

  // Format score data for DrivingScoreChart
  const scoreData = metricsData.map(item => ({
    date: item.date,
    score: item.score
  }));

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="Safety Score"
                value={`${Math.round(safetyScore)}/100`}
                icon={<ShieldIcon sx={{ fontSize: 40, color: '#4caf50' }} />}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="Driving Events"
                value={String(eventCount)}
                icon={<WarningIcon sx={{ fontSize: 40, color: '#ff9800' }} />}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="Alerts Generated"
                value={String(alertCount)}
                icon={<NotificationsIcon sx={{ fontSize: 40, color: '#f44336' }} />}
                color="#f44336"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard 
                title="Distance Driven"
                value={`${distanceDriven.toFixed(1)} km`}
                icon={<SpeedIcon sx={{ fontSize: 40, color: '#2196f3' }} />}
                color="#2196f3"
              />
            </Grid>
          </Grid>
          
          {/* Charts - pass the correctly transformed data */}
          <DrivingScoreChart data={scoreData} />
          <DrivingMetricsChart data={metricsData} />
        </>
      )}
    </Box>
  );
}

export default OverviewTab;