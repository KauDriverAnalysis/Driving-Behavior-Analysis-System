'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { config } from '@/config';
import { CarCustomersFilters } from '@/components/dashboard-customer/car-customers/car-customers-filters';
import { CarCustomersTable } from '@/components/dashboard-customer/car-customers/car-customers-table';
import AddCarCustomerDialog from './add-car-customer-dialog';
import type { CarCustomer } from '@/components/dashboard-customer/car-customers/car-customers-table';
import Layout from '@/app/dashboard-customer/layout';

const carCustomers: CarCustomer[] = [
  {
    id: 'CAR-001',
    name: 'Toyota Corolla',
    owner: 'John Doe',
    licensePlate: 'ABC-123',
    createdAt: dayjs().subtract(10, 'minutes').toDate(),
  },
  {
    id: 'CAR-002',
    name: 'Honda Civic',
    owner: 'Jane Smith',
    licensePlate: 'XYZ-789',
    createdAt: dayjs().subtract(20, 'minutes').toDate(),
  },
];

function applyPagination(rows: CarCustomer[], page: number, rowsPerPage: number): CarCustomer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function CarCustomersPage(): React.JSX.Element {
  const router = useRouter();
  const page = 0;
  const rowsPerPage = 5;

  const paginatedCarCustomers = applyPagination(carCustomers, page, rowsPerPage);

  const [openCarCustomerDialog, setOpenCarCustomerDialog] = useState(false);

  const handleOpenCarCustomerDialog = () => {
    setOpenCarCustomerDialog(true);
  };

  const handleCloseCarCustomerDialog = () => {
    setOpenCarCustomerDialog(false);
  };

  return (
    <Layout>
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Car Customers</Typography>
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
            <Button startIcon={<AddIcon />} variant="contained" onClick={handleOpenCarCustomerDialog}>
              Add Car Customer
            </Button>
          </div>
        </Stack>
        <CarCustomersFilters />
        <CarCustomersTable
          count={paginatedCarCustomers.length}
          page={page}
          rows={paginatedCarCustomers}
          rowsPerPage={rowsPerPage}
        />
        <AddCarCustomerDialog open={openCarCustomerDialog} onClose={handleCloseCarCustomerDialog} />
      </Stack>
    </Layout>
  );
}