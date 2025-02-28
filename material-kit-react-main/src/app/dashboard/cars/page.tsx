// filepath: /c:/Users/Eyad/Documents/GitHub/Driving-Behavior-Analysis-System/qqq/Driving-Behavior-Analysis-System/material-kit-react-main/src/pages/dashboard/cars.tsx
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { CarsTable } from '@/components/dashboard/cars/CarsTable';

const cars = [
  { id: 'CAR-001', name: 'Car A', status: 'Active' },
  { id: 'CAR-002', name: 'Car B', status: 'Inactive' },
  // Add more cars here
];

export default function Cars(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedCars = applyPagination(cars, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Cars</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Import
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add
          </Button>
        </div>
      </Stack>
      <CarsTable
        count={cars.length}
        page={page}
        rows={paginatedCars}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: any[], page: number, rowsPerPage: number): any[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}