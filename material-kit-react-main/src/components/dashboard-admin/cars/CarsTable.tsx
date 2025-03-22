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
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
  onStatusChange: (car: Car, newStatus: 'online' | 'offline') => void;
  userType: string;   // User type (customer, company, employee, admin)
  userId: string;     // User ID
  initialRowsPerPage?: number;
}

export function CarsTable({
  onEdit,
  onDelete,
  onStatusChange,
  userType,
  userId,
  initialRowsPerPage = 10
}: CarsTableProps) {
  // State for cars data
  const [cars, setCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  // Fetch cars when component mounts or when userType/userId changes
  React.useEffect(() => {
    fetchCars();
  }, [userType, userId]);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build the URL with query parameters
      let url = 'http://localhost:8000/api/cars/';
      
      // Add userType and userId as query parameters if they exist
      if (userType && userId) {
        url += `?userType=${userType}&userId=${userId}`;
      }
      
      console.log(`Fetching cars from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setCars(data);
      
      // Reset to first page when data changes
      setPage(0);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
  };

  const handleRefresh = () => {
    fetchCars();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card>
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            action={
              <IconButton color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Box>
      </Card>
    );
  }

  // Show message when no cars are found
  if (cars.length === 0) {
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
            {cars
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((car) => (
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
        onPageChange={(_, newPage) => handlePageChange(newPage)}
        onRowsPerPageChange={(event) => handleRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}