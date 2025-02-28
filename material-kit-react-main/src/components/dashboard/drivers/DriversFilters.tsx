import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

export function DriversFilters(): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <TextField label="Search drivers" variant="outlined" fullWidth />
    </Box>
  );
}
