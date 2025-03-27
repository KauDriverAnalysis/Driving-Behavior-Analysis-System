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
  Box,
  Typography,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Update the Car interface to match exactly with your backend response
export interface Car {
  id: string;
  Model_of_car: string;
  TypeOfCar: string;
  Plate_number: string;
  Release_Year_car: number;
  State_of_car: 'online' | 'offline';
  device_id: string;
  customer_id: number | null;
  company_id: number | null;
}

// Remove the filtering logic from CarsTable and update the props interface
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
  userType: string;
  userId: string;
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
  loading = false,
  userType,
  userId
}: CarsTableProps) {
  const handleRefresh = () => {
    // Implement refresh logic if needed
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return null; // Return nothing when no cars are found
  }

  return (
    <Card>
      {userType === 'employee' && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="subtitle2" color="textSecondary">
            Showing cars associated with your company
          </Typography>
        </Box>
      )}
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((car) => (
              <TableRow hover key={car.id}>
                <TableCell>{car.id}</TableCell>
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