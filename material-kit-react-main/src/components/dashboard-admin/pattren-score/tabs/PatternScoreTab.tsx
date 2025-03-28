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
  Divider 
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
}

interface ScorePattern {
  id: string;
  name: string;
  value: number;
  color: string;
  icon: JSX.Element;
}

const PatternScoreTab: React.FC<PatternScoreTabProps> = ({ showNotification }) => {
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

  // Handle slider change
  const handleSliderChange = (id: string, newValue: number) => {
    setScorePattern(prev => 
      prev.map(item => item.id === id ? { ...item, value: newValue } : item)
    );
  };

  // Save changes
  const handleSave = () => {
    if (isValid) {
      // Here you would typically save to backend
      showNotification('Pattern score weights saved successfully');
      setIsDirty(false);
    } else {
      showNotification('Total weight must equal 100%', 'error');
    }
  };

  // Reset to default
  const handleReset = () => {
    setScorePattern(initialScorePattern);
    showNotification('Pattern score weights reset to default');
  };

  // Prepare data for the pie chart
  const chartData = scorePattern.map(item => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
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
            <Grid container spacing={3}>
              {scorePattern.map((item) => (
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
                      {/* Random score between 60-95 for display purposes */}
                      {Math.floor(Math.random() * 35) + 60}/100
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weight: {item.value}%
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 3,
              p: 2,
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DirectionsCarIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="primary.main">Overall Safety Score</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">82/100</Typography>
                </Box>
              </Box>
              <Button variant="contained">View Detailed Report</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatternScoreTab;