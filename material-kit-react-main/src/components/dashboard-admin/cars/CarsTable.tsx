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
  rows?: Car[];
  count?: number;
  page?: number;
  rowsPerPage?: number;
  refreshTrigger?: number;
}

function noop(): void {
  // do nothing
}

export function CarsTable({ rows = [], count = 0, page = 0, rowsPerPage = 0, refreshTrigger = 0 }: CarsTableProps): React.JSX.Element {
  const [cars, setCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/cars/')
      .then((response) => response.json())
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching car data:', error);
        setLoading(false);
      });
  }, [refreshTrigger]);

  const rowIds = React.useMemo(() => {
    return cars.map((car) => car.id);
  }, [cars]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < cars.length;
  const selectedAll = cars.length > 0 && selected?.size === cars.length;

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
              {cars.map((row) => {
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
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.model}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.plateNumber}</TableCell>
                    <TableCell>{row.releaseYear}</TableCell>
                    <TableCell>{row.state}</TableCell>
                    <TableCell>{row.deviceId}</TableCell>
                    <TableCell>{row.customerId}</TableCell>
                    <TableCell>{row.companyId}</TableCell>
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