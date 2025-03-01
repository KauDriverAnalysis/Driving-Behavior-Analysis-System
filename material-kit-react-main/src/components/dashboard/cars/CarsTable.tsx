import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';

interface Car {
  id: string;
  model: string;
  type: string;
  plateNumber: string;
  releaseYear: number;
  state: string;
  deviceId: string;
  customerId?: string | null;
  companyId?: string | null;
}

interface CarsTableProps {
  rows: Car[];
  count: number;
  page: number;
  rowsPerPage: number;
}

export function CarsTable({ rows }: CarsTableProps): React.JSX.Element {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Plate Number</TableCell>
            <TableCell>Release Year</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Device ID</TableCell>
            <TableCell>Customer ID</TableCell>
            <TableCell>Company ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.model}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.plateNumber}</TableCell>
              <TableCell>{row.releaseYear}</TableCell>
              <TableCell>{row.state}</TableCell>
              <TableCell>{row.deviceId}</TableCell>
              <TableCell>{row.customerId || 'N/A'}</TableCell>
              <TableCell>{row.companyId || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
