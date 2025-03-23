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
}

export function DriversTable({
  items,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: DriversTableProps) {
  const [loading, setLoading] = React.useState(true);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  
  React.useEffect(() => {
    if (items && items.length > 0) {
      // If items are provided, use them
      setDrivers(items);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      const userType = localStorage.getItem('userType') || localStorage.getItem('user-type');
      const userId = localStorage.getItem('userId') || localStorage.getItem('user-id');
      
      // Build URL with query parameters
      let url = 'http://localhost:8000/api/drivers/';
      if (userType && userId) {
        url += `?userType=${userType}&userId=${userId}`;
      }
      
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setDrivers(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching driver data:', error);
          setLoading(false);
        });
    }
  }, [items]);

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