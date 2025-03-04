import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';

interface Car {
  id: string;
  model: string;
  status: string;
  score?: number;
  speed?: number;
}

interface CarsTableProps {
  cars: Car[];
  onSelectCar: (carId: string) => void;
  selectedCar: string | null;
}

export function CarsTable({ cars, onSelectCar, selectedCar }: CarsTableProps): React.JSX.Element {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Speed (km/h)</TableCell>
            <TableCell>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cars.map((car) => (
            <TableRow 
              key={car.id} 
              onClick={() => onSelectCar(car.id)}
              hover
              selected={selectedCar === car.id}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{car.id}</TableCell>
              <TableCell>{car.model}</TableCell>
              <TableCell>
                <Chip 
                  label={car.status} 
                  color={car.status === 'Active' ? 'success' : 'default'} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{car.speed || 'N/A'}</TableCell>
              <TableCell>{car.score || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}