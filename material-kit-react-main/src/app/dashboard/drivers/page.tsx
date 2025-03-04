'use client';

import * as React from 'react';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DriversTable } from '@/components/dashboard/drivers/DriversTable';
import { DriversFilters } from '@/components/dashboard/drivers/DriversFilters';
import AddDriverDialog from './add-driver-dialog';

const drivers = [
  { id: 'DRV-001', name: 'Driver A', status: 'Active' },
  { id: 'DRV-002', name: 'Driver B', status: 'Inactive' },
  // Add more drivers here
];

export default function Drivers(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openDriverDialog, setOpenDriverDialog] = useState(false);
  const page = 0;
  const rowsPerPage = 5;

  // Function to trigger refresh
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenDriverDialog = () => {
    setOpenDriverDialog(true);
  };

  const handleCloseDriverDialog = () => {
    setOpenDriverDialog(false);
  };

  const handleSuccessfulOperation = () => {
    refreshData(); // Refresh data after successful operation
  };

  const paginatedDrivers = applyPagination(drivers, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Drivers</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<EditIcon />}>
              Edit
            </Button>
            <Button color="inherit" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<AddIcon />} variant="contained" onClick={handleOpenDriverDialog}>
            Add
          </Button>
        </div>
      </Stack>
      <DriversFilters />
      <DriversTable 
        count={drivers.length} 
        page={page} 
        rows={paginatedDrivers} 
        rowsPerPage={rowsPerPage}
        refreshTrigger={refreshTrigger}
      />
      <AddDriverDialog 
        open={openDriverDialog} 
        onClose={handleCloseDriverDialog}
        onSuccess={handleSuccessfulOperation} 
      />
    </Stack>
  );
}

function applyPagination(rows: any[], page: number, rowsPerPage: number): any[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}