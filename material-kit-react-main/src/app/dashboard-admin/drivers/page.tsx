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
  CircularProgress,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { DriversTable } from '@/components/dashboard-admin/drivers/DriversTable';
import AddDriverDialog from './add-driver-dialog';
import EditDriverDialog from './edit-driver-dialog';

interface Driver {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  company_id: string;
  car_id: string;
}

interface Car {
  id: string;
  model: string;
  plateNumber: string;
}

export default function DriversPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);

  // Fetch drivers data
  useEffect(() => {
    setLoading(true);
    fetch('https://driving-behavior-analysis-system.onrender.com/api/drivers/')
      .then(response => response.json())
      .then(data => {
        setDrivers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching drivers:', error);
        setLoading(false);
      });
  }, [refreshTrigger]);

  // Fetch available cars
  useEffect(() => {
    const company_id = localStorage.getItem('company_id') || 
                     localStorage.getItem('companyId') || 
                     localStorage.getItem('employee-company-id');
                     
  if (company_id) {
    fetch(`https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=company&userId=${company_id}`)
      .then(response => response.json())
      .then(data => {
        const cars = data.map((car: any) => ({
          id: car.id,
          model: car.model || car.Model_of_car,
          plateNumber: car.plateNumber || car.Plate_number
        }));
        setAvailableCars(cars);
      })
      .catch(error => console.error('Error fetching cars:', error));
  }
}, [refreshTrigger]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteDriver = (driver: Driver) => {
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (driverToDelete) {
      fetch(`https://driving-behavior-analysis-system.onrender.com/api/delete_driver/${driverToDelete.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Failed to delete driver');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          setRefreshTrigger(prev => prev + 1); // Refresh the list
        })
        .catch(error => {
          console.error('Error deleting driver:', error);
        })
        .finally(() => {
          setDeleteConfirmOpen(false);
          setDriverToDelete(null);
        });
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDialogOpen(true);
  };

  const handleCarAssign = async (driverId: string, carId: string) => {
    try {
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_driver/${driverId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          car_id: carId
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign car');
      }
  
      // Refresh the drivers list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error assigning car:', error);
      throw error;
    }
  };

  // Filter drivers based on search term only (no status filter)
  const filteredDrivers = React.useMemo(() => {
    return drivers.filter(driver => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || (
        (driver.name?.toLowerCase() || '').includes(searchTermLower) ||
        (driver.phone_number?.toLowerCase() || '').includes(searchTermLower) ||
        (driver.gender?.toLowerCase() || '').includes(searchTermLower)
      );
      
      return matchesSearch;
    });
  }, [drivers, searchTerm]);

  // Paginate drivers
  const paginatedDrivers = filteredDrivers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Drivers
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
            placeholder="Search drivers..."
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
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ ml: 'auto' }}
          >
            Add Driver
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
            {filteredDrivers.length === 0 && (
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
                    {drivers.length === 0 
                      ? "No drivers found" 
                      : "No drivers match your search"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {drivers.length === 0 
                      ? "Start by adding your first driver."
                      : "Try adjusting your search criteria"}
                  </Typography>
                </Box>
                
                {drivers.length === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    size="large"
                    sx={{
                      minWidth: 200,
                      py: 1
                    }}
                  >
                    Add First Driver
                  </Button>
                )}
              </Paper>
            )}
            
            {filteredDrivers.length > 0 && (
              <DriversTable
                items={paginatedDrivers}
                count={filteredDrivers.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(newRowsPerPage) => {
                  setRowsPerPage(newRowsPerPage);
                  setPage(0);
                }}
                onDelete={handleDeleteDriver}
                onEdit={handleEditDriver}
                onCarAssign={handleCarAssign}
                availableCars={availableCars}
              />
            )}
          </>
        )}
      </Card>

      {/* Add Driver Dialog */}
      <AddDriverDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          setRefreshTrigger(prev => prev + 1); // Refresh the list
          setOpenDialog(false);
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
            Are you sure you want to delete {driverToDelete?.name}? This action cannot be undone.
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

      {/* Edit Driver Dialog */}
      <EditDriverDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedDriver(null);
        }}
        onSubmit={(updatedDriver) => {
          // Call API to update driver
          fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_driver/${updatedDriver.id}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDriver),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to update driver');
              }
              setRefreshTrigger(prev => prev + 1); // Refresh the list
            })
            .catch(error => {
              console.error('Error updating driver:', error);
            })
            .finally(() => {
              setEditDialogOpen(false);
              setSelectedDriver(null);
            });
        }}
        driver={selectedDriver}
      />
    </Box>
  );
}