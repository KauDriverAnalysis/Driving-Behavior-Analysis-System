import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';
import { DriversTable } from '@/components/dashboard/drivers/DriversTable';
import { DriversFilters } from '@/components/dashboard/drivers/DriversFilters';

const drivers = [
  { id: 'DRV-001', name: 'John Doe', avatar: '/assets/avatar-1.png', email: 'john.doe@example.com', phone: '123-456-7890', createdAt: dayjs().subtract(2, 'hours').toDate() },
  { id: 'DRV-002', name: 'Jane Smith', avatar: '/assets/avatar-2.png', email: 'jane.smith@example.com', phone: '987-654-3210', createdAt: dayjs().subtract(2, 'hours').toDate() },
  // Add more drivers here
];

export default function Drivers(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedDrivers = applyPagination(drivers, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Drivers</Typography>
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
      <DriversFilters />
      <DriversTable
        count={drivers.length}
        page={page}
        rows={paginatedDrivers}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: any[], page: number, rowsPerPage: number): any[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}