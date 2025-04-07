// TripHistory.tsx
import * as React from 'react';
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

interface TripHistoryItem {
  tripNumber: number;
  time: string;
  score: number;
  miles: number;
}

interface TripHistoryProps {
  data: TripHistoryItem[];
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
      label={`${score}/100`}
      size="small"
      color={getScoreColor(score)}
      variant="outlined"
    />
  );
};

export function TripHistory({ data, timeFrame }: TripHistoryProps): React.JSX.Element {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Trip History"
        subheader={`Recent trips from the last ${timeFrame === '1d' ? 'day' : timeFrame === '7d' ? 'week' : 'month'}`}
      />
      <Divider />
      <Box sx={{ minWidth: 800, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trip </TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Miles</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Grade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((trip) => (
              <TableRow
                hover
                key={trip.tripNumber}
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
                      Trip {trip.tripNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{trip.time}</TableCell>
                <TableCell>{trip.miles}</TableCell>
                <TableCell>{trip.score}</TableCell>
                <TableCell>
                  <ScoreChip score={trip.score} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}