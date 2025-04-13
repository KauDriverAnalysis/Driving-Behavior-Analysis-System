// TripHistory.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface Trip {
  trip_id: string;
  car_id: number;
  car_model: string;
  plate_number: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  distance_km: number;
  score: number;
  events: {
    harsh_braking: number;
    harsh_acceleration: number;
    swerving: number;
    over_speed: number;
  };
}

interface TripHistoryProps {
  selectedCar?: string;
  timeFrame: '1d' | '7d' | '30d';
}

const ScoreChip = ({ score }: { score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Chip
      label={`${Math.round(score)}/100`}
      size="small"
      color={getScoreColor(score)}
      variant="outlined"
    />
  );
};

export function TripHistory({ selectedCar, timeFrame }: TripHistoryProps): React.JSX.Element {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const customerId = localStorage.getItem('customerId') || 
                            localStorage.getItem('customer_id') || 
                            localStorage.getItem('customer-id') ||
                            localStorage.getItem('userId');
        
        // Determine the endpoint based on car selection
        const endpoint = selectedCar && selectedCar !== 'all'
          ? `https://driving-behavior-analysis-system.onrender.com/api/car-trips/${selectedCar}/?time_frame=${timeFrame}`
          : `https://driving-behavior-analysis-system.onrender.com/api/car-trips/?customer_id=${customerId}&time_frame=${timeFrame}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trip data:', error);
        setError('Failed to load trip data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [selectedCar, timeFrame]);

  // Format time in a readable way using native JS Date
  const formatTripTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      // Format: "Mar 15, 2:30 PM"
      return date.toLocaleDateString('en-US', {
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Trip History"
        subheader={`Real trips from the last ${timeFrame === '1d' ? 'day' : timeFrame === '7d' ? 'week' : 'month'}`}
      />
      <Divider />
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {!loading && !error && trips.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No trips found for the selected time period.
          </Typography>
        </Box>
      )}
      
      {!loading && !error && trips.length > 0 && (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Trip Details</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Distance</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.map((trip) => (
                <TableRow
                  hover
                  key={trip.trip_id}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsCarIcon
                        sx={{
                          color: 'primary.main',
                          fontSize: 20,
                          mr: 1
                        }}
                      />
                      <Typography variant="body2">
                        {trip.car_model} ({trip.plate_number})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatTripTime(trip.start_time)}</TableCell>
                  <TableCell>{trip.distance_km.toFixed(1)} km</TableCell>
                  <TableCell>{trip.score.toFixed(0)}</TableCell>
                  <TableCell>
                    <ScoreChip score={trip.score} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}