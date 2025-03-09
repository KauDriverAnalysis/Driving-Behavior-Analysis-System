'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  IconButton,
  Tooltip,
  Card,
  TablePagination,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Driver {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  company_id: string;
  car_id: string;
  status?: 'active' | 'inactive';
  email?: string;
}

interface DriversTableProps {
  items: Driver[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onStatusChange: (driver: Driver, newStatus: 'active' | 'inactive') => void;
}

export function DriversTable({
  items,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onStatusChange
}: DriversTableProps) {
  const [loading, setLoading] = React.useState(true);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  
  React.useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/drivers/')
      .then((response) => response.json())
      .then((data) => {
        setDrivers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching driver data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Company ID</TableCell>
              <TableCell>Car ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow hover key={driver.id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.gender}</TableCell>
                <TableCell>{driver.phone_number}</TableCell>
                <TableCell>{driver.company_id}</TableCell>
                <TableCell>{driver.car_id}</TableCell>
                <TableCell>
                  <Tooltip title="Click to change status">
                    <Chip
                      label={driver.status || 'active'}
                      color={driver.status === 'inactive' ? 'error' : 'success'}
                      size="small"
                      onClick={() => onStatusChange(driver, driver.status === 'active' ? 'inactive' : 'active')}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(driver)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(driver)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}