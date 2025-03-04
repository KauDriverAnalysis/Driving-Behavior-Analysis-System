import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import TablePagination from '@mui/material/TablePagination';
import { useSelection } from '@/hooks/use-selection';

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

function noop(): void {
  // do nothing
}

export function DriversTable({ rows, count, page, rowsPerPage }: DriversTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((driver) => driver.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(event) => {
                      if (event.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Company ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.has(row.id);

                return (
                  <TableRow hover key={row.id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            selectOne(row.id);
                          } else {
                            deselectOne(row.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>{row.phone_number}</TableCell>
                    <TableCell>{row.company_id}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}