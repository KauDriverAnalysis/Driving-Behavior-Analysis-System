'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  InputAdornment,
  Stack,
  MenuItem,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CarCustomersTable } from '@/components/dashboard-customer/car-customers/car-customers-table';
import EditCarDialog from './EditCarDialog';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddCarCustomerDialog from './AddCarCustomerDialog';

// Enhanced mock data
const cars = [
  {
    id: '1',
    name: 'Toyota Corolla',
    owner: 'John Doe',
    licensePlate: 'ABC-123',
    status: 'active',
    model: '2022',
    lastUpdate: new Date().toLocaleDateString()
  },
  {
    id: '2',
    name: 'Honda Civic',
    owner: 'Jane Smith',
    licensePlate: 'XYZ-789',
    status: 'active',
    model: '2023',
    lastUpdate: new Date().toLocaleDateString()
  }
];

const CarCustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<typeof cars[0] | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<typeof cars[0] | null>(null);

  // Filter handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEditCar = (car: typeof cars[0]) => {
    setSelectedCar(car);
    setEditDialogOpen(true);
  };

  const handleDeleteCar = (car: typeof cars[0]) => {
    setCarToDelete(car);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (carToDelete) {
      // Add your delete logic here
      console.log('Deleting car:', carToDelete);
      // Update your cars array after deletion
    }
    setDeleteConfirmOpen(false);
    setCarToDelete(null);
  };

  const handleSaveEdit = (updatedCar: typeof cars[0]) => {
    console.log('Saving updated car:', updatedCar);
    // Add your update logic here
    setEditDialogOpen(false);
    setSelectedCar(null);
  };

  const handleAddCar = (carData: typeof cars[0]) => {
    // Add the new car to your cars array
    const newCar = {
      ...carData,
      id: `CAR-${cars.length + 1}`,
      lastUpdate: new Date().toLocaleDateString()
    };
    
    // Update your cars state here
    console.log('New car added:', newCar);
    // You would typically make an API call here
    
    // Show success message if needed
  };

  // Filter logic
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Car Customers
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
            onChange={handleSearch}
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
            onChange={handleStatusChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
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
        <CarCustomersTable
          count={filteredCars.length}
          items={filteredCars.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          page={page}
          rowsPerPage={rowsPerPage}
          onEdit={handleEditCar}
          onDelete={handleDeleteCar}
        />
      </Card>

      {/* Edit Car Dialog */}
      <EditCarDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCar(null);
        }}
        onSubmit={handleSaveEdit}
        car={selectedCar}
      />

      {/* Add Car Dialog */}
      <AddCarCustomerDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleAddCar}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the car "{carToDelete?.name}" owned by {carToDelete?.owner}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarCustomersPage;