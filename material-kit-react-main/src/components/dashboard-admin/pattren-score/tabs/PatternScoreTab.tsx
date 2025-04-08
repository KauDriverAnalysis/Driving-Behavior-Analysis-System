import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Slider, 
  Grid, 
  Button, 
  Alert, 
  Stack, 
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BrakeIcon from '@mui/icons-material/NotInterested';

// Define interfaces
interface PatternScoreTabProps {
  showNotification: (message: string, type?: string) => void;
  selectedCar?: string;
}

// Fixed interface - removed duplicate declaration and fixed property types
interface ScorePattern {
  id: string;
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const PatternScoreTab: React.FC<PatternScoreTabProps> = ({ 
  showNotification,
  selectedCar 
}) => {
  // Initial score pattern data
  const initialScorePattern: ScorePattern[] = [
    { id: 'harshBraking', name: 'Harsh Braking', value: 30, color: '#FF5252', icon: <BrakeIcon /> },
    { id: 'hardAcceleration', name: 'Hard Acceleration', value: 25, color: '#FF9800', icon: <TrendingUpIcon /> },
    { id: 'swerving', name: 'Swerving', value: 20, color: '#2196F3', icon: <CompareArrowsIcon /> },
    { id: 'overSpeed', name: 'Over Speed', value: 25, color: '#E040FB', icon: <SpeedIcon /> },
  ];

  // State for the score pattern
  const [scorePattern, setScorePattern] = useState<ScorePattern[]>(initialScorePattern);
  const [isValid, setIsValid] = useState(true);
  const [totalScore, setTotalScore] = useState(100);
  const [isDirty, setIsDirty] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recalculatingScores, setRecalculatingScores] = useState(false);

  // Add these new state variables at the top with other state declarations
  const [historicalScores, setHistoricalScores] = useState<{
    harshBraking: number;
    hardAcceleration: number;
    swerving: number;
    overSpeed: number;
    overall: number;
  }>({
    harshBraking: 0,
    hardAcceleration: 0,
    swerving: 0,
    overSpeed: 0,
    overall: 0
  });
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  // Effect to validate the total equals 100
  useEffect(() => {
    const sum = scorePattern.reduce((acc, item) => acc + item.value, 0);
    setTotalScore(sum);
    setIsValid(sum === 100);
    // Mark as dirty if it's different from initial values
    const hasChanged = JSON.stringify(scorePattern.map(s => s.value)) !== 
                       JSON.stringify(initialScorePattern.map(s => s.value));
    setIsDirty(hasChanged);
  }, [scorePattern]);

  // Use selectedCar in useEffect to fetch data
  useEffect(() => {
    if (selectedCar) {
      setLoading(true);
      console.log(`Fetching pattern score data for car: ${selectedCar}`);
      
      // For now, simulate loading with a timeout
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [selectedCar]);

  // Load saved score pattern from backend
  useEffect(() => {
    // Get company ID from localStorage
    const companyId = localStorage.getItem('companyId') || 
                    localStorage.getItem('company_id') ||
                    localStorage.getItem('company-id') ||
                    localStorage.getItem('userId');
    
    const userType = "company"; // Use company as the default user type
    
    if (companyId) {
      setLoading(true);
      
      fetch(`https://driving-behavior-analysis-system.onrender.com/api/score-pattern/?userType=${userType}&userId=${companyId}`)
        .then(response => response.json())
        .then(data => {
          // If there's saved pattern data, use it
          if (data && Object.keys(data).length > 0) {
            setScorePattern([
              { ...scorePattern[0], value: data.harshBraking || 30 },
              { ...scorePattern[1], value: data.harshAcceleration || 25 },
              { ...scorePattern[2], value: data.swerving || 20 },
              { ...scorePattern[3], value: data.overSpeed || 25 },
            ]);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading score pattern:', error);
          setLoading(false);
        });
    }
  }, []);

  // Add this useEffect to fetch historical data based on selectedCar
  useEffect(() => {
    const fetchHistoricalScores = async () => {
      setHistoricalLoading(true);
      setHistoricalError(null);
      
      try {
        // Determine the endpoint based on whether a specific car is selected
        const endpoint = selectedCar
          ? `https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${selectedCar}/`
          : `https://driving-behavior-analysis-system.onrender.com/api/fleet-overview/?time_frame=7d`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const data = await response.json();
        
        if (selectedCar) {
          // Parse data for a specific car
          const currentData = data.current || {};
          const summaryData = data.summary || {};
          
          setHistoricalScores({
            harshBraking: summaryData.total_harsh_braking || currentData.harsh_braking_events || 0,
            hardAcceleration: summaryData.total_harsh_acceleration || currentData.harsh_acceleration_events || 0,
            swerving: summaryData.total_swerving || currentData.swerving_events || 0,
            overSpeed: summaryData.total_over_speed || currentData.over_speed_events || 0,
            overall: summaryData.avg_score || currentData.score || 0
          });
        } else {
          // Parse data for fleet overview
          const events = data.events || {};
          
          setHistoricalScores({
            harshBraking: events.harsh_braking || 0,
            hardAcceleration: events.harsh_acceleration || 0,
            swerving: events.swerving || 0,
            overSpeed: events.over_speed || 0,
            overall: data.fleet_stats?.avg_score || 0
          });
        }
        
        setHistoricalLoading(false);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setHistoricalError('Failed to load historical data');
        setHistoricalLoading(false);
      }
    };
    
    // Call the function whenever selectedCar changes
    fetchHistoricalScores();
  }, [selectedCar]);

  // Handle slider change
  const handleSliderChange = (id: string, newValue: number) => {
    setScorePattern(prev => 
      prev.map(item => item.id === id ? { ...item, value: newValue } : item)
    );
  };

  // Handle save function to send data to backend
  const handleSave = () => {
    if (isValid) {
      // Get company ID from localStorage
      const companyId = localStorage.getItem('companyId') || 
                      localStorage.getItem('company_id') ||
                      localStorage.getItem('company-id') ||
                      localStorage.getItem('userId');
      
      if (!companyId) {
        showNotification('Company ID not found. Please login again.', 'error');
        return;
      }
      
      // Prepare data to send
      const patternData = {
        userType: 'company',
        userId: companyId,
        harshBraking: scorePattern.find(p => p.id === 'harshBraking')?.value || 30,
        harshAcceleration: scorePattern.find(p => p.id === 'hardAcceleration')?.value || 25,
        swerving: scorePattern.find(p => p.id === 'swerving')?.value || 20,
        overSpeed: scorePattern.find(p => p.id === 'overSpeed')?.value || 25,
        potentialSwerving: 0 // Default, not used in UI
      };
      
      // Send to backend
      fetch('https://driving-behavior-analysis-system.onrender.com/api/score-pattern/update/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patternData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to save pattern');
          }
          return response.json();
        })
        .then(data => {
          showNotification('Pattern score weights saved successfully');
          setIsDirty(false);
        })
        .catch(error => {
          console.error('Error saving pattern data:', error);
          showNotification('Failed to save pattern data', 'error');
        });
    } else {
      showNotification('Total weight must equal 100%', 'error');
    }
  };

  // Reset to default
  const handleReset = () => {
    setScorePattern(initialScorePattern);
    showNotification('Pattern score weights reset to default');
  };

  const handleRecalculateScores = () => {
    if (selectedCar) {
      setRecalculatingScores(true);
      
      fetch('https://driving-behavior-analysis-system.onrender.com/api/car-scores/recalculate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          carId: selectedCar,
          days: 7  // Recalculate last 7 days of data
        })
      })
        .then(response => response.json())
        .then(data => {
          showNotification(`Scores recalculated successfully! Updated ${data.updatedCount} records.`);
          setRecalculatingScores(false);
        })
        .catch(error => {
          console.error('Error recalculating scores:', error);
          showNotification('Failed to recalculate scores', 'error');
          setRecalculatingScores(false);
        });
    } else {
      showNotification('Please select a car first', 'warning');
    }
  };

  // Prepare data for the pie chart
  const chartData = scorePattern.map(item => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        Customizing score pattern for car: {selectedCar || 'All cars in fleet'}
      </Typography>
      <Grid container spacing={3}>
        {/* Left column - Chart */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            height: '100%',
            minHeight: 400
          }}>
            <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
              Score Pattern Visualization
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Visual representation of how each behavior affects the overall safety score
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={scorePattern[index].color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Right column - Controls */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            minHeight: 400 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Customize Score Pattern
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: isValid ? 'success.light' : 'error.light',
                  color: isValid ? 'success.dark' : 'error.dark',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  Total: {totalScore}%
                </Typography>
              </Box>
            </Box>
            
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Adjust the importance of each driving behavior in calculating the overall safety score.
              The total must equal 100%.
            </Typography>

            {!isValid && (
              <Alert severity="error" sx={{ mb: 3 }}>
                The total weight must equal exactly 100%. Current total: {totalScore}%
              </Alert>
            )}

            <Stack spacing={4} sx={{ mb: 4 }}>
              {scorePattern.map((item) => (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        color: item.color, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0.5,
                        borderRadius: '50%',
                        bgcolor: `${item.color}20` // 20% opacity version of the color
                      }}>
                        {item.icon}
                      </Box>
                      <Typography fontWeight="medium">{item.name}</Typography>
                    </Box>
                    <Typography fontWeight="bold" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {item.value}%
                    </Typography>
                  </Box>
                  <Slider
                    value={item.value}
                    onChange={(_, newValue) => handleSliderChange(item.id, newValue as number)}
                    aria-labelledby={`${item.id}-slider`}
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                    sx={{ 
                      color: item.color,
                      '& .MuiSlider-thumb': {
                        height: 20,
                        width: 20,
                      },
                    }}
                  />
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                disabled={!isDirty}
              >
                Reset to Default
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={!isValid || !isDirty}
              >
                Save Changes
              </Button>
              <Button 
                variant="contained" 
                onClick={handleRecalculateScores}
                disabled={recalculatingScores || !selectedCar}
              >
                {recalculatingScores ? 'Recalculating...' : 'Recalculate Scores'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Historical Score Card */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
          }}>
            <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
              Historical Score Calculation
            </Typography>
            
            {historicalLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {historicalError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {historicalError}
              </Alert>
            )}
            
            {!historicalLoading && !historicalError && (
              <>
                <Grid container spacing={3}>
                  {scorePattern.map((item) => {
                    // Map scorePattern items to historicalScores keys
                    const scoreKey = item.id as keyof typeof historicalScores;
                    const itemScore = item.id === 'harshBraking' ? historicalScores.harshBraking :
                                      item.id === 'hardAcceleration' ? historicalScores.hardAcceleration :
                                      item.id === 'swerving' ? historicalScores.swerving :
                                      item.id === 'overSpeed' ? historicalScores.overSpeed : 0;
                    
                    // Calculate a normalized score from 0-100 based on the event count
                    // Lower event counts = higher scores
                    const normalizedScore = Math.max(0, Math.min(100, 100 - (itemScore > 100 ? 100 : itemScore)));
                    
                    return (
                      <Grid item xs={12} sm={6} md={3} key={item.id}>
                        <Paper sx={{ 
                          p: 2, 
                          bgcolor: `${item.color}10`, // Very light version of the color
                          borderLeft: 4,
                          borderColor: item.color,
                          borderRadius: 2
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                            <Box sx={{ 
                              color: item.color, 
                              display: 'flex',
                            }}>
                              {item.icon}
                            </Box>
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {normalizedScore.toFixed(0)}/100
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Events: {itemScore} | Weight: {item.value}%
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 3,
                  p: 2,
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DirectionsCarIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="primary.main">Overall Safety Score</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {historicalScores.overall.toFixed(1)}/100
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatternScoreTab;