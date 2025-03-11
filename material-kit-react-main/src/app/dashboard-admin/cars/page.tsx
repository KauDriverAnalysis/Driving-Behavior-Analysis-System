'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
  MenuItem,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CarsTable } from '@/components/dashboard-admin/cars/CarsTable';
import EditCarDialog from './edit-car-dialog';
import AddCarDialog from './add-car-dialog';

// Updated interface to match Django model field names exactly
interface Car {
  id: string;
  Model_of_car: string;
  TypeOfCar: string;
  Plate_number: string;
  Release_Year_car: number;
  State_of_car: 'online' | 'offline';
  device_id: string;
  customer_id: any;
  company_id: any;
}

export default function CarsPage(): React.JSX.Element {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch cars data
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/cars/')
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteCar = (car: Car) => {
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
            throw new Error('Failed to delete car');
          }
          return response.json();
        })
        .then(() => {
          setRefreshTrigger(prev => prev + 1); // Refresh the list
        })
        .catch(error => {
          console.error('Error deleting car:', error);
        })
        .finally(() => {
          setDeleteConfirmOpen(false);
          setCarToDelete(null);
        });
    }
  };

  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
    setEditDialogOpen(true);
  };

  const handleStatusChange = async (car: Car, newStatus: 'online' | 'offline') => {
    try {
      // Simplified - only send the status field that needs to change
      const response = await fetch(`http://localhost:8000/api/update_car/${car.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ State_of_car: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.errors || 'Failed to update car status');
      }
      
      // If successful, refresh the data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating car status:', error);
    }
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };


  const filteredCars = cars.filter(car => {
    const matchesSearch = 
            car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // This is the issue - statusFilter needs to match the field name in your data
    const matchesStatus = statusFilter === 'all' || car.State_of_car === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate cars
  const paginatedCars = filteredCars.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
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
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CarsTable
            items={paginatedCars}
            count={filteredCars.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
            onDelete={handleDeleteCar}
            onEdit={handleEditCar}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        )}
      </Card>

      {/* Edit Car Dialog */}
      <EditCarDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCar(null);
        }}
        onSubmit={(updatedCar) => {
          // Format data for API - convert from camelCase to the format backend expects
          const formattedCar = {
            Model_of_car: updatedCar.model,
            TypeOfCar: updatedCar.type,
            Plate_number: updatedCar.plateNumber,
            Release_Year_car: updatedCar.releaseYear,
            State_of_car: updatedCar.state,
            device_id: updatedCar.deviceId,
            company_id: updatedCar.companyId,
            customer_id: updatedCar.customerId
          };

          fetch(`http://localhost:8000/api/update_car/${updatedCar.id}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedCar),
          })
            .then(response => {
              if (!response.ok) {
                return response.json().then(data => {
                  throw new Error(data.error || 'Failed to update car');
                });
              }
              return response.json();
            })
            .then(() => {
              setRefreshTrigger(prev => prev + 1); // Refresh the list
            })
            .catch(error => {
              console.error('Error updating car:', error);
            })
            .finally(() => {
              setEditDialogOpen(false);
              setSelectedCar(null);
            });
        }}
        car={selectedCar}
      />

      {/* Add Car Dialog */}
      <AddCarDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSuccess={() => {
          setRefreshTrigger(prev => prev + 1); // Refresh the list after adding
          setOpenAddDialog(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this car with plate number "{carToDelete?.Plate_number}"? This action cannot be undone.
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