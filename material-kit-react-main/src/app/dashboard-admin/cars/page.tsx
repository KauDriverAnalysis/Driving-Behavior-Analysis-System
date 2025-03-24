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
  CircularProgress,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CarsTable } from '@/components/dashboard-admin/cars/CarsTable';
import EditCarDialog from './edit-car-dialog';
import AddCarDialog from './add-car-dialog';

// Update the Car interface
interface Car {
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

export default function CarsPage(): React.JSX.Element {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Get user info from local storage - fixed to match client.ts implementation
  const userType = localStorage.getItem('userType') || localStorage.getItem('user-type');
  const userId = localStorage.getItem('userId') || localStorage.getItem('user-id');
  
  // Debug
  console.log('Cars page - userType:', userType, 'userId:', userId);

  // Fetch cars data
  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        // Update the URL to point to your Django backend
        const response = await fetch(`http://localhost:8000/api/cars/?userType=${userType || ''}&userId=${userId || ''}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, [userId, userType, refreshTrigger]);

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
        body: JSON.stringify({ state: newStatus }),
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

  // Update the filteredCars logic with proper field names
  const filteredCars = React.useMemo(() => {
    return cars.filter(car => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || (
        car.model.toLowerCase().includes(searchTermLower) ||
        car.plateNumber.toLowerCase().includes(searchTermLower) ||
        car.type.toLowerCase().includes(searchTermLower)
      );
      
      const matchesStatus = statusFilter === 'all' || car.state === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [cars, searchTerm, statusFilter]);

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
                      ? "No cars for company" 
                      : "No cars match your search"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {cars.length === 0 
                      ? "Start managing your fleet by adding your first car."
                      : "Try adjusting your search or filter criteria"}
                  </Typography>
                </Box>
                
                {cars.length === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddDialog(true)}
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
            
            {filteredCars.length > 0 && (
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
                userId={userId || ''}
                userType={userType || ''}
              />
            )}
          </>
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
            model: updatedCar.model,
            type: updatedCar.type,
            plateNumber: updatedCar.plateNumber,
            Release_Year_car: updatedCar.releaseYear,
            state: updatedCar.state,
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
            Are you sure you want to delete this car with plate number "{carToDelete?.plateNumber}"? This action cannot be undone.
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