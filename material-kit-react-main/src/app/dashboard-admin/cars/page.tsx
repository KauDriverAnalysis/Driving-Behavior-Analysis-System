'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CarsTable } from '@/components/dashboard-admin/cars/CarsTable';
import EditCarDialog from './edit-car-dialog';
import AddCarDialog from './add-car-dialog';

const MOCK_CARS = [
  {
    id: '1',
    name: 'Car 1',
    brand: 'Toyota',
    model: 'Camry',
    year: '2023',
    plate_number: 'ABC 123',
    owner: 'John Doe',
    status: 'active' as const
  },
  // Add more mock cars as needed
];

export default function CarsPage(): React.JSX.Element {
  const [cars, setCars] = useState(MOCK_CARS);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<typeof MOCK_CARS[0] | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<typeof MOCK_CARS[0] | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteCar = (car: typeof MOCK_CARS[0]) => {
    setCarToDelete(car);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (carToDelete) {
      console.log('Deleting car:', carToDelete);
    }
    setDeleteConfirmOpen(false);
    setCarToDelete(null);
  };

  const handleEditCar = (car: typeof MOCK_CARS[0]) => {
    setSelectedCar(car);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedCar: typeof MOCK_CARS[0]) => {
    console.log('Saving updated car:', updatedCar);
    setEditDialogOpen(false);
    setSelectedCar(null);
  };

  const handleAddCar = (newCar: Omit<typeof MOCK_CARS[0], 'id'>) => {
    console.log('Adding new car:', newCar);
    // Add your API call here
    setOpenAddDialog(false);
  };

  const handleStatusChange = (car: typeof MOCK_CARS[0], newStatus: 'active' | 'inactive') => {
    const updatedCars = cars.map(c => 
      c.id === car.id ? { ...c, status: newStatus } : c
    );
    setCars(updatedCars);
    console.log(`Changed status of car ${car.id} to ${newStatus}`);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.plate_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Cars
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
            onChange={handleStatusFilterChange}
            sx={{ minWidth: 150 }}
            label="Status Filter"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            sx={{ ml: 'auto' }}
          >
            Add Car
          </Button>
        </Stack>
      </Card>

      {/* Table */}
      <CarsTable
        items={filteredCars.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
        count={filteredCars.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onDelete={handleDeleteCar}
        onEdit={handleEditCar}
        onStatusChange={handleStatusChange}
      />

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
      <AddCarDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
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
            Are you sure you want to delete the car "{carToDelete?.name}"? This action cannot be undone.
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
}