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
  CircularProgress,
  Card,
  Paper
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
    
    // Get customer ID from localStorage
    const customerId = localStorage.getItem('customer-id');
    
    // Create URL with query parameters
    const url = customerId 
      ? `https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=customer&userId=${customerId}`
      : 'https://driving-behavior-analysis-system.onrender.com/api/cars/';
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setCars(data);
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
    // Get customer ID from localStorage with fallbacks
    const customerId = localStorage.getItem('customer-id') || 
                       localStorage.getItem('customerId') || 
                       localStorage.getItem('customer_id');
    
    if (!customerId) {
      console.error('No customer ID found in localStorage');
      // Consider showing an error message to the user
      return;
    }
    
    // Create request data
    const requestData = {
      Model_of_car: updatedCar.Model_of_car,
      TypeOfCar: updatedCar.TypeOfCar,
      Plate_number: updatedCar.Plate_number,
      Release_Year_car: updatedCar.Release_Year_car,
      State_of_car: updatedCar.State_of_car,
      device_id: updatedCar.device_id,
      customer_id: customerId // Add customer ID to the update request
    };
    
    console.log('Updating car with data:', requestData);
    
    // Call API to update car
    fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_car/${updatedCar.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to update car');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Car updated successfully:', data);
        setRefreshTrigger(prev => prev + 1);
        setEditDialogOpen(false);
        setSelectedCar(null);
      })
      .catch(error => {
        console.error('Error updating car:', error);
        // Consider showing an error message to the user
      });
  };

  // Delete handlers
  const handleDelete = (car: Car) => {
    setCarToDelete(car);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (carToDelete) {
      fetch(`https://driving-behavior-analysis-system.onrender.com/api/delete_car/${carToDelete.id}/`, {
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

  const handleAddCar = () => {
    // Just refresh the cars list after the dialog component handles the API call
    setRefreshTrigger(prev => prev + 1);
    setOpenDialog(false);
  };

  const handleStatusChange = async (car: Car, newStatus: 'online' | 'offline') => {
    try {
      const customerId = localStorage.getItem('customer-id');
      
      if (!customerId) {
        console.error('No customer ID found');
        return;
      }

      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_car/${car.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          State_of_car: newStatus,
          customer_id: customerId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update car status');
      }
      
      // Refresh the cars list after successful update
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating car status:', error);
      // You might want to show an error message to the user here
    }
  };

  // Filter logic for the table
  const filteredCars = cars.filter(car => {
    // First check if all required properties exist and have values
    const model =car.Model_of_car || '';
    const plateNumber =car.Plate_number || '';
    const type = car.TypeOfCar || '';
    
    const matchesSearch = 
      model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || car.State_of_car === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedCars = filteredCars.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Cars
      </Typography>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            size="small"
            placeholder="Search cars..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            sx={{ minWidth: 150 }}
            label="Status Filter"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
          </TextField>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ ml: 'auto' }}
          >
            Add Car
          </Button>
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredCars.length === 0 && (
              <Paper 
                sx={{ 
                  p: 4, 
                  mt: 2, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    {cars.length === 0 
                      ? "No cars found for your account" 
                      : "No cars match your search"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {cars.length === 0 
                      ? "Start by adding your first car to track and manage it"
                      : "Try adjusting your search or filter criteria"}
                  </Typography>
                </Box>
                
                {cars.length === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    size="large"
                    sx={{
                      minWidth: 200,
                      py: 1
                    }}
                  >
                    Add First Car
                  </Button>
                )}
              </Paper>
            )}
            
            {/* Only render the table when there are cars to display */}
            {filteredCars.length > 0 && (
              <CarCustomersTable
                count={filteredCars.length}
                items={paginatedCars}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                page={page}
                rowsPerPage={rowsPerPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                loading={loading}
              />
            )}
          </>
        )}
      </Card>

      {/* Rest of your dialogs remain unchanged */}
      {/* Add Car Dialog */}
      <AddCarCustomerDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleAddCar} // Rename onSubmit to onSuccess for consistency
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
            Are you sure you want to delete the car {carToDelete?.Model_of_car} with plate number {carToDelete?.Plate_number}?
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