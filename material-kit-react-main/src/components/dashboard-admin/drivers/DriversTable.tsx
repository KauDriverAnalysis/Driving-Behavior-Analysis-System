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
  gender: 'male' | 'female';
  phone_number: string;
  company_id: string; // Adjust this type as needed
}

interface DriversTableProps {
  rows?: Driver[];
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
}

function noop(): void {
  // do nothing
}

export function DriversTable({ rows = [], count = 0, page = 0, rowsPerPage = 0, refreshTrigger = 0 }: DriversTableProps): React.JSX.Element {
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

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
  }, [refreshTrigger]);

  const rowIds = React.useMemo(() => {
    return drivers.map((driver) => driver.id);
  }, [drivers]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < drivers.length;
  const selectedAll = drivers.length > 0 && selected?.size === drivers.length;

  if (loading) {
    return <div>Loading...</div>;
  }

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
              {drivers.map((row) => {
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