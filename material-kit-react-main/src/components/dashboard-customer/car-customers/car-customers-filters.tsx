import * as React from 'react';
import { TextField, Button, Stack } from '@mui/material';

export function CarCustomersFilters(): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2}>
      <TextField label="Search by name" variant="outlined" />
      <Button variant="contained">Search</Button>
    </Stack>
  );
}