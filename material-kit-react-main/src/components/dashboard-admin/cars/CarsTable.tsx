import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  IconButton,
  Tooltip,
  Card,
  TablePagination,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Updated interface to match Django model field names exactly
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

interface CarsTableProps {
  items: Car[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
  onStatusChange: (car: Car, newStatus: 'online' | 'offline') => void;
  loading?: boolean;
}

export function CarsTable({
  items,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  loading = false
}: CarsTableProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Plate Number</TableCell>
              <TableCell>Release Year</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Device ID</TableCell>
              {/* Removed Customer ID column */}
              {/* Removed Company ID column */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((car) => (
              <TableRow hover key={car.id}>
                <TableCell>{car.id}</TableCell>
                <TableCell>{car.model}</TableCell>
                <TableCell>{car.type}</TableCell>
                <TableCell>{car.plateNumber}</TableCell>
                <TableCell>{car.releaseYear}</TableCell>
                <TableCell>
                  <Tooltip title="Click to change state">
                    <Chip 
                      label={car.state} 
                      color={car.state === 'online' ? 'success' : 'error'}
                      size="small"
                      onClick={() => onStatusChange(car, car.state === 'online' ? 'offline' : 'online')}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>{car.deviceId}</TableCell>
                {/* Removed Customer ID cell */}
                {/* Removed Company ID cell */}
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => onEdit(car)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(car)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}