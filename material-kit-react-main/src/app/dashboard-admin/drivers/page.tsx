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
  TableCell,
  Tooltip,
  Chip,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { DriversTable } from '@/components/dashboard-admin/drivers/DriversTable';
import AddDriverDialog from './add-driver-dialog';
import EditDriverDialog from './edit-driver-dialog';

// Mock data - replace with actual API call
const MOCK_DRIVERS = [
  {
    id: '1',
    name: 'John Doe',
    gender: 'Male',
    phone_number: '+1 234-567-8901',
    company_id: 'COMP-1',
    car_id: 'CAR-1'
  },
  // Add more mock drivers as needed
];

export default function DriversPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<typeof MOCK_DRIVERS[0] | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<typeof MOCK_DRIVERS[0] | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteDriver = (driver: typeof MOCK_DRIVERS[0]) => {
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (driverToDelete) {
      console.log('Deleting driver:', driverToDelete);
    }
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  const handleEditDriver = (driver: typeof MOCK_DRIVERS[0]) => {
    setSelectedDriver(driver);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedDriver: typeof MOCK_DRIVERS[0]) => {
    console.log('Saving updated driver:', updatedDriver);
    setEditDialogOpen(false);
    setSelectedDriver(null);
  };

  const handleStatusChange = async (driver: typeof MOCK_DRIVERS[0], newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`http://localhost:8000/api/drivers/${driver.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setRefreshTrigger(prev => prev + 1); // Refresh the table
      } else {
        console.error('Failed to update driver status');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const filteredDrivers = MOCK_DRIVERS.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            label="Status Filter"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
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
        <DriversTable
          items={filteredDrivers.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
          count={filteredDrivers.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          onDelete={handleDeleteDriver}
          onEdit={handleEditDriver}
          onStatusChange={handleStatusChange}
        />
      </Card>

      {/* Add Driver Dialog */}
      <AddDriverDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          console.log('Driver added successfully');
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
          console.log('Updated driver:', updatedDriver);
          // Add your update logic here
          setEditDialogOpen(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
      />
    </Box>
  );
}