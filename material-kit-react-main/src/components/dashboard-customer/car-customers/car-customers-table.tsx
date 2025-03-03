import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

export interface CarCustomer {
  id: string;
  name: string;
  owner: string;
  licensePlate: string;
  createdAt: Date;
}

interface CarCustomersTableProps {
  count: number;
  page: number;
  rows: CarCustomer[];
  rowsPerPage: number;
}

export function CarCustomersTable({ count, page, rows, rowsPerPage }: CarCustomersTableProps): React.JSX.Element {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>License Plate</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell>{row.licensePlate}</TableCell>
              <TableCell>{row.createdAt.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
