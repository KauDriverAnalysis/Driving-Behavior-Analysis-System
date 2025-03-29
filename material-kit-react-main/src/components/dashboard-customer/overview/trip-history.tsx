// TripHistory.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';

interface TripHistoryProps {
  data: {
    start: string;
    destination: string;
    time: string;
    score: number;
    miles: number;
  }[];
  timeFrame: '1d' | '7d' | '30d';
}

// Function to determine score color
const getScoreColor = (score: number) => {
  if (score >= 90) return 'success';
  if (score >= 75) return 'info';
  if (score >= 60) return 'warning';
  return 'error';
};

export function TripHistory({ data, timeFrame }: TripHistoryProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Trip History
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Your driving activity for the past {timeFrame === '1d' ? 'day' : timeFrame === '7d' ? 'week' : 'month'}
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Trip</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Distance</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((trip, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {trip.start}
                      </Typography>
                      <ArrowRightAltIcon sx={{ mx: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {trip.destination}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{trip.time}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StraightenIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{trip.miles} miles</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Chip 
                        label={`${trip.score}/100`} 
                        size="small" 
                        color={getScoreColor(trip.score)} 
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {data.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No trips recorded in this time period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}