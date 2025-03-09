'use client';

import React, { useState } from 'react';
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
  DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { EmployeesTable } from '@/components/dashboard-admin/employee/employees-table';
import AddEmployeeDialog from './add-employee-dialog';
import EditEmployeeDialog from './edit-employee-dialog';

const MOCK_EMPLOYEES = [
  {
    id: '1',
    name: 'John Doe',
    gender: 'Male',
    phone_number: '+1 234-567-8901',
    address: '123 Main St, City',
    Email: 'john.doe@example.com',
    department: 'IT',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    gender: 'Female',
    phone_number: '+1 234-567-8902',
    address: '456 Oak Ave, Town',
    Email: 'jane.smith@example.com',
    department: 'HR',
    joinDate: '2023-02-20'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    gender: 'Male',
    phone_number: '+1 234-567-8903',
    address: '789 Pine Rd, Village',
    Email: 'mike.j@example.com',
    department: 'Sales',
    joinDate: '2023-03-10'
  }
];

export default function EmployeesPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<typeof MOCK_EMPLOYEES[0] | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof MOCK_EMPLOYEES[0] | null>(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteEmployee = (employee: typeof MOCK_EMPLOYEES[0]) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      console.log('Deleting employee:', employeeToDelete.name);
    }
    setDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  const handleEditEmployee = (employee: typeof MOCK_EMPLOYEES[0]) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedEmployee: typeof MOCK_EMPLOYEES[0]) => {
    console.log('Saving updated employee:', updatedEmployee);
    // Add your update logic here
    setEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = MOCK_EMPLOYEES.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Employees
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
            placeholder="Search employees..."
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
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ ml: 'auto' }}
          >
            Add Employee
          </Button>
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        <EmployeesTable
          items={filteredEmployees.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
          count={filteredEmployees.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          onDelete={handleDeleteEmployee}
          onEdit={handleEditEmployee}
        />
      </Card>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={(data) => {
          console.log('New employee:', data);
          setOpenDialog(false);
        }}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleSaveEdit}
        employee={selectedEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {employeeToDelete?.name}? This action cannot be undone.
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