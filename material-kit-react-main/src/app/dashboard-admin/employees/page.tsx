
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { config } from '@/config';
import { EmployeesFilters } from '@/components/dashboard-admin/employee/employees-filters';
import { EmployeesTable } from '@/components/dashboard-admin/employee/employees-table';
import AddEmployeeDialog from './add-employee-dialog';
import type { Employee } from '@/components/dashboard-admin/employee/employees-table';

// Remove the metadata export
// export const metadata = { title: `Employees | Dashboard | ${config.site.name}` } satisfies Metadata;

const employees: Employee[] = [
  {
    id: 'USR-001',
    name: 'John Doe',
    avatar: '/assets/avatar-1.png',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: { city: 'New York', country: 'USA', state: 'NY', street: '123 Main St' },
  },
  {
    id: 'USR-002',
    name: 'Jane Smith',
    avatar: '/assets/avatar-2.png',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    address: { city: 'Los Angeles', country: 'USA', state: 'CA', street: '456 Elm St' },
  },
  {
    id: 'USR-003',
    name: 'Alice Johnson',
    avatar: '/assets/avatar-3.png',
    email: 'alice.johnson@example.com',
    phone: '555-123-4567',
    address: { city: 'Chicago', country: 'USA', state: 'IL', street: '789 Oak St' },
  },
  {
    id: 'USR-004',
    name: 'Bob Brown',
    avatar: '/assets/avatar-4.png',
    email: 'bob.brown@example.com',
    phone: '444-555-6666',
    address: { city: 'Houston', country: 'USA', state: 'TX', street: '101 Pine St' },
  },
];

function applyPagination(rows: Employee[], page: number, rowsPerPage: number): Employee[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const page = 0;
  const rowsPerPage = 5;

  const paginatedEmployees = applyPagination(employees, page, rowsPerPage);

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);

  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };

  const handleAddEmployee = () => {
    router.push('/dashboard-admin/employees/add-employee');
  };

  return (
    <>
      <Head>
        <title>Employees | Dashboard | {config.site.name}</title>
      </Head>
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Employees</Typography>
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
            <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </div>
        </Stack>
        <EmployeesFilters />
        <EmployeesTable
          count={paginatedEmployees.length}
          page={page}
          rows={paginatedEmployees}
          rowsPerPage={rowsPerPage}
        />
        <AddEmployeeDialog open={openEmployeeDialog} onClose={handleCloseEmployeeDialog} />
      </Stack>
    </>
  );
}
