import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Updated interface to match the Car model
export interface Car {
  id: string;
  Model_of_car: string;      // Model_of_car
  TypeOfCar: string;       // TypeOfCar
  Plate_number: string; // Plate_number
  Release_Year_car: number; // Release_Year_car
  State_of_car: 'online' | 'offline'; // State_of_car
  device_id: string;   // device_id
  customer_id: number | null; // customer_id FK
  company_id: number | null; // company_id FK
}

interface CarCustomersTableProps {
  count: number;
  items: Car[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
  onStatusChange: (car: Car, newStatus: 'online' | 'offline') => void; // Add this prop
  loading?: boolean;
}

export const CarCustomersTable = ({
  count,
  items,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  onEdit,
  onDelete,
  onStatusChange, // Add this prop
  loading = false
}: CarCustomersTableProps) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Plate Number</TableCell>
            <TableCell>Release Year</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Device ID</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((car) => (
            <TableRow hover key={car.id}>
              <TableCell>{car.Model_of_car}</TableCell>
              <TableCell>{car.TypeOfCar}</TableCell>
              <TableCell>{car.Plate_number}</TableCell>
              <TableCell>{car.Release_Year_car}</TableCell>
              <TableCell>
                <Tooltip title="Click to change state">
                  <Chip 
                    label={car.State_of_car} 
                    color={car.State_of_car === 'online' ? 'success' : 'error'}
                    size="small"
                    onClick={() => onStatusChange(car, car.State_of_car === 'online' ? 'offline' : 'online')}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                  />
                </Tooltip>
              </TableCell>
              <TableCell>{car.device_id}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(car)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(car)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};