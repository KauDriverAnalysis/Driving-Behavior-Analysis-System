import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CarCustomer {
  id: string;
  name: string;
  owner: string;
  licensePlate: string;
  status: string;
  model: string;
  lastUpdate: string;
}

interface CarCustomersTableProps {
  count: number;
  items: CarCustomer[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  onEdit: (car: CarCustomer) => void;
  onDelete: (car: CarCustomer) => void;
}

export const CarCustomersTable = ({
  count,
  items,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  onEdit,
  onDelete
}: CarCustomersTableProps) => {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Car Name</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>License Plate</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Update</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((car) => (
            <TableRow hover key={car.id}>
              <TableCell>{car.name}</TableCell>
              <TableCell>{car.owner}</TableCell>
              <TableCell>{car.licensePlate}</TableCell>
              <TableCell>{car.model}</TableCell>
              <TableCell>
                <Chip
                  label={car.status}
                  color={car.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>{car.lastUpdate}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(car)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(car)}
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
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};