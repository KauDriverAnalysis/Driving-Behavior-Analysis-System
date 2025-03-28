'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  Tooltip,
  Card,
  TablePagination,
  CircularProgress,
  Box,
  Menu,
  MenuItem,
  Button,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Update the Driver interface to include car details
interface Driver {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  car_id: string;
  car?: {
    id: string;
    Model_of_car: string;
    Plate_number: string;
  };
}

interface Car {
  id: string;
  model: string;
  plateNumber: string;
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
  onCarAssign: (driverId: string, carId: string) => Promise<void>;
  availableCars: Car[];
}

// Update the table headers and rows
export function DriversTable({
  items,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onCarAssign,
  availableCars
}: DriversTableProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedDriverId, setSelectedDriverId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, driverId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDriverId(driverId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedDriverId(null);
  };

  const handleCarSelect = async (carId: string) => {
    if (selectedDriverId) {
      setLoading(true);
      try {
        await onCarAssign(selectedDriverId, carId);
      } catch (error) {
        console.error('Error assigning car:', error);
      } finally {
        setLoading(false);
        handleClose();
      }
    }
  };

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Car Assigned</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((driver) => (
              <TableRow hover key={driver.id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.gender}</TableCell>
                <TableCell>{driver.phone_number}</TableCell>
                <TableCell>
                  <Button
                    endIcon={<KeyboardArrowDownIcon />}
                    onClick={(e) => handleClick(e, driver.id)}
                    sx={{ 
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      color: 'text.primary'
                    }}
                  >
                    {driver.car ? 
                      `${driver.car.Model_of_car} (${driver.car.Plate_number})` : 
                      'No car assigned'
                    }
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedDriverId === driver.id}
                    onClose={handleClose}
                  >
                    {loading ? (
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography>Updating...</Typography>
                      </Box>
                    ) : (
                      availableCars.map((car) => (
                        <MenuItem 
                          key={car.id} 
                          onClick={() => handleCarSelect(car.id)}
                          selected={driver.car?.id === car.id}
                        >
                          {car.model} ({car.plateNumber})
                        </MenuItem>
                      ))
                    )}
                  </Menu>
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