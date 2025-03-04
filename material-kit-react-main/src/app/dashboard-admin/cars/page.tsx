'use client';

import * as React from 'react';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CarsTable } from '@/components/dashboard-admin/cars/CarsTable';
import { CarsFilters } from '@/components/dashboard-admin/cars/CarsFilters';
import AddCarDialog from './add-car-dialog';

const cars = [
  { id: 'CAR-001', name: 'Car A', status: 'Active' },
  { id: 'CAR-002', name: 'Car B', status: 'Inactive' },
  // Add more cars here
];

function applyPagination(rows: any[], page: number, rowsPerPage: number): any[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function Cars(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openCarDialog, setOpenCarDialog] = useState(false);
  const page = 0;
  const rowsPerPage = 5;

  const paginatedCars = applyPagination(cars, page, rowsPerPage);
  
  // Function to trigger refresh
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenCarDialog = () => {
    setOpenCarDialog(true);
  };

  const handleCloseCarDialog = () => {
    setOpenCarDialog(false);
  };
  
  // Add success handler
  const handleSuccessfulOperation = () => {
    refreshData();
    setOpenCarDialog(false);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Cars</Typography>
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
          <Button startIcon={<AddIcon />} variant="contained" onClick={handleOpenCarDialog}>
            Add
          </Button>
        </div>
      </Stack>
      <CarsFilters />
      <CarsTable 
        count={cars.length} 
        page={page} 
        rows={paginatedCars} 
        rowsPerPage={rowsPerPage}
        refreshTrigger={refreshTrigger}
      />
      <AddCarDialog 
        open={openCarDialog} 
        onClose={handleCloseCarDialog}
        onSuccess={handleSuccessfulOperation}
      />
    </Stack>
  );
}