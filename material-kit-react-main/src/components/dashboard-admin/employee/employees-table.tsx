import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Box,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Employee {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  address: string;
  email: string;
  password: string;
}

interface EmployeesTableProps {
  items: Employee[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onDelete: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export function EmployeesTable({
  items,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onEdit
}: EmployeesTableProps) {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/employees/')
      .then((response) => response.json())
      .then((data) => {
        console.log('Received data:', data); // Debug log
        setEmployees(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Password</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow hover key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.gender}</TableCell>
              <TableCell>{employee.phone_number}</TableCell>
              <TableCell>{employee.address}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>••••••••</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(employee)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onDelete(employee)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={employees.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}