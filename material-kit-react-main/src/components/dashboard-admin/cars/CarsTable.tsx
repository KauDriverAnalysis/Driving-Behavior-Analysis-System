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

interface Car {
  id: string;
  Model: string;
  Type: string;
  plate_number: string;
  release_year: string;
  state: 'online' | 'offline';
  device_id: string;
  customer_id: string;
  company_id: string;
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
  onStatusChange
}: CarsTableProps) {
  const [cars, setCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/cars/')
      .then((response) => response.json())
      .then((data) => {
        // Log the received data to check its structure
        console.log('Received data:', data);
        
        // Map the API response to match your Car interface
        const mappedCars = data.map((item: any) => ({
          id: item.id,
          Model: item.model || item.Model || '',
          Type: item.type || item.Type || '',
          plate_number: item.plate_number || '',
          release_year: item.release_year || '',
          state: item.state || 'offline',
          device_id: item.device_id || '',
          customer_id: item.customer_id || '',
          company_id: item.company_id || ''
        }));
        
        setCars(mappedCars);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching car data:', error);
        setLoading(false);
      });
  }, [refreshTrigger]);

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
              <TableCell>Customer ID</TableCell>
              <TableCell>Company ID</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow hover key={car.id}>
                <TableCell>{car.id}</TableCell>
                <TableCell>{car.Model}</TableCell>
                <TableCell>{car.Type}</TableCell>
                <TableCell>{car.plate_number}</TableCell>
                <TableCell>{car.release_year}</TableCell>
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
                <TableCell>{car.device_id}</TableCell>
                <TableCell>{car.customer_id}</TableCell>
                <TableCell>{car.company_id}</TableCell>
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
        count={cars.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}