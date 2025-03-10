'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import { CarCustomersTable, Car } from '@/components/dashboard-customer/car-customers/car-customers-table';
import EditCarDialog from './EditCarDialog';
import AddCarCustomerDialog from './AddCarCustomerDialog';

const CarCustomersPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch cars data
  useEffect(() => {
    setLoading(true);
    // Only show cars that belong to the current logged-in customer
    // We'll need to get the customer ID from the session/auth context
    fetch('http://localhost:8000/api/cars/')
      .then(response => response.json())
      .then(data => {
        // Filter cars to only show those assigned to the current customer
        // The backend might do this filtering for us based on auth token
        const customerCars = data.filter((car: any) => {
          // In a real implementation, you'd get the customer ID from auth context
          // For now, just show all cars or adjust this filter as needed
          return true; // or: return car.customerId === currentCustomerId;
        });
        
        setCars(customerCars);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching cars:', error);
        setLoading(false);
      });
  }, [refreshTrigger]);

  // Filter handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Dialog handlers
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Edit handlers
  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedCar(null);
  };

  const handleSaveEdit = (updatedCar: Car) => {
    // Call API to update car
    fetch(`http://localhost:8000/api/update_car/${updatedCar.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Model_of_car: updatedCar.model,
        TypeOfCar: updatedCar.type,
        Plate_number: updatedCar.plateNumber,
        Release_Year_car: updatedCar.releaseYear,
        State_of_car: updatedCar.state,
        device_id: updatedCar.deviceId
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update car');
        }
        setRefreshTrigger(prev => prev + 1);
        setEditDialogOpen(false);
        setSelectedCar(null);
      })
      .catch(error => {
        console.error('Error updating car:', error);
      });
  };

  // Delete handlers
  const handleDelete = (car: Car) => {
    setCarToDelete(car);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (carToDelete) {
      fetch(`http://localhost:8000/api/delete_car/${carToDelete.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Failed to delete car');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          // Show success notification if you want
          setRefreshTrigger(prev => prev + 1); // Refresh the car list
        })
        .catch(error => {
          console.error('Error deleting car:', error);
          // Show error notification if you want
        })
        .finally(() => {
          setDeleteConfirmOpen(false);
          setCarToDelete(null);
        });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCarToDelete(null);
  };

  const handleAddCar = (carData: Omit<Car, 'id'>) => {
    // Add API call to create a new car
    fetch('http://localhost:8000/api/create_car/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Model_of_car: carData.model,
        TypeOfCar: carData.type,
        Plate_number: carData.plateNumber,
        Release_Year_car: carData.releaseYear,
        State_of_car: carData.state,
        device_id: carData.deviceId || ''
        // customer_id will be set by the backend based on token
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create car');
        }
        return response.json();
      })
      .then(() => {
        setRefreshTrigger(prev => prev + 1);
        setOpenDialog(false);
      })
      .catch(error => {
        console.error('Error creating car:', error);
      });
  };

  // Filter logic for the table
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || car.state === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedCars = filteredCars.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={4}
          >
            <Typography variant="h4">
              My Cars
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={handleOpenDialog}
            >
              Add
            </Button>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </TextField>
          </Stack>

          <CarCustomersTable
            count={filteredCars.length}
            items={paginatedCars}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </Stack>
      </Container>

      {/* Add Car Dialog */}
      <AddCarCustomerDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleAddCar}
      />

      {/* Edit Car Dialog */}
      {selectedCar && (
        <EditCarDialog
          open={editDialogOpen}
          onClose={handleCloseEdit}
          onSubmit={handleSaveEdit}
          car={selectedCar}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the car {carToDelete?.model} with plate number {carToDelete?.plateNumber}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarCustomersPage;