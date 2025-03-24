'use client';

import React, { useState, useEffect } from 'react';
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
import { EmployeesTable } from '@/components/dashboard-admin/employee/employees-table';
import AddEmployeeDialog from './add-employee-dialog';
import EditEmployeeDialog from './edit-employee-dialog';

// Define Employee interface
interface Employee {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  address: string;
  Email: string;
  Password?: string;
  department?: string;
  joinDate?: string;
}

export default function EmployeesPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch employees data
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/employees/')
      .then(response => response.json())
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
        setLoading(false);
      });
  }, [refreshTrigger]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      // Call API to delete employee
      fetch(`http://localhost:8000/api/delete_employee/${employeeToDelete.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Failed to delete employee');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          setRefreshTrigger(prev => prev + 1); // Refresh the list after deletion
        })
        .catch(error => {
          console.error('Error deleting employee:', error);
          // You could add a snackbar notification here for the error
        })
        .finally(() => {
          setDeleteConfirmOpen(false);
          setEmployeeToDelete(null);
        });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  // Filter employees based on search term
  const filteredEmployees = React.useMemo(() => {
    return employees.filter(employee => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || (
        (employee.name?.toLowerCase() || '').includes(searchTermLower) ||
        (employee.Email?.toLowerCase() || '').includes(searchTermLower) ||
        (employee.phone_number?.toLowerCase() || '').includes(searchTermLower) ||
        (employee.address?.toLowerCase() || '').includes(searchTermLower)
      );
      
      return matchesSearch;
    });
  }, [employees, searchTerm]);

  // Paginate employees
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredEmployees.length === 0 && (
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
                    {employees.length === 0 
                      ? "No employees found" 
                      : "No employees match your search"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {employees.length === 0 
                      ? "Start by adding your first employee."
                      : "Try adjusting your search criteria"}
                  </Typography>
                </Box>
                
                {employees.length === 0 && (
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
                    Add First Employee
                  </Button>
                )}
              </Paper>
            )}
            
            {filteredEmployees.length > 0 && (
              <EmployeesTable
                items={paginatedEmployees}
                count={filteredEmployees.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(newRowsPerPage) => {
                  setRowsPerPage(newRowsPerPage);
                  setPage(0);
                }}
                onDelete={handleDeleteEmployee}
                onEdit={handleEditEmployee}
              />
            )}
          </>
        )}
      </Card>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          setRefreshTrigger(prev => prev + 1); // Refresh the list after adding
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
        onSubmit={(updatedEmployee) => {
          // Call API to update employee
          // Format the data to match the Django backend expectations
          const formattedEmployee = {
            Name: updatedEmployee.name,  // Capital N
            gender: updatedEmployee.gender.toLowerCase(), // lowercase gender
            phone_number: updatedEmployee.phone_number,
            address: updatedEmployee.address,
            Email: updatedEmployee.Email, // Capital E
            // Don't include password if it's empty
            ...(updatedEmployee.Password && { Password: updatedEmployee.Password })
          };

          fetch(`http://localhost:8000/api/update_employee/${updatedEmployee.id}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedEmployee),
          })
            .then(response => {
              if (!response.ok) {
                return response.json().then(data => {
                  throw new Error(data.error || 'Failed to update employee');
                });
              }
              return response.json();
            })
            .then(() => {
              setRefreshTrigger(prev => prev + 1); // Refresh the list
            })
            .catch(error => {
              console.error('Error updating employee:', error);
            })
            .finally(() => {
              setEditDialogOpen(false);
              setSelectedEmployee(null);
            });
        }}
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