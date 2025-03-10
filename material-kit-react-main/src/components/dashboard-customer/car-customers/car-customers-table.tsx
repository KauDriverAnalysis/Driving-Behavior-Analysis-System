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
  model: string;      // Model_of_car
  type: string;       // TypeOfCar
  plateNumber: string; // Plate_number
  releaseYear: number; // Release_Year_car
  state: 'online' | 'offline'; // State_of_car
  deviceId: string;   // device_id
  customerId: number | null; // customer_id FK
  companyId: number | null; // company_id FK
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
              <TableCell>{car.model}</TableCell>
              <TableCell>{car.type}</TableCell>
              <TableCell>{car.plateNumber}</TableCell>
              <TableCell>{car.releaseYear}</TableCell>
              <TableCell>
                <Chip
                  label={car.state}
                  color={car.state === 'online' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>{car.deviceId}</TableCell>
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