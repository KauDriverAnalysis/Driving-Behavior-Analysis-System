import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import dayjs from 'dayjs';

interface Driver {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  createdAt: Date;
}

interface DriversTableProps {
  rows: Driver[];
  count: number;
  page: number;
  rowsPerPage: number;
}

export function DriversTable({ rows, count, page, rowsPerPage }: DriversTableProps): React.JSX.Element {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{dayjs(row.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}