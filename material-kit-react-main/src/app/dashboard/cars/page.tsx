import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { CarsTable } from '@/components/dashboard/cars/CarsTable';
import { CarsFilters } from '@/components/dashboard/cars/CarsFilters'; // Import the CarsFilters component

const cars = [
  { id: 'CAR-001', name: 'Car A', status: 'Active' },
  { id: 'CAR-002', name: 'Car B', status: 'Inactive' },
  // Add more cars here
];

export default function Cars(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedCars = applyPagination(cars, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Cars</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {/* Edit Button */}
            <Button color="inherit">
              Edit
            </Button>
            {/* Delete Button */}
            <Button color="inherit">
              Delete
            </Button>
          </Stack>
        </Stack>
        <div>
          {/* Add Button */}
          <Button variant="contained">
            Add
          </Button>
        </div>
      </Stack>
      {/* Add the CarsFilters component */}
      <CarsFilters />
      <CarsTable
        count={cars.length}
        page={page}
        rows={paginatedCars}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: any[], page: number, rowsPerPage: number): any[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
