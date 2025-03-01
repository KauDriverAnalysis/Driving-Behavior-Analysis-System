import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';

interface Driver {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  company_id: string; // Assuming company_id is a string, you may need to adjust depending on your data model
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
            <TableCell>Gender</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Company ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.gender}</TableCell>
              <TableCell>{row.phone_number}</TableCell>
              <TableCell>{row.company_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
