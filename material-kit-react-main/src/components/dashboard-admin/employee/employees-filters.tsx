import * as React from 'react';
import {
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface EmployeesFiltersProps {
  onSearch: (value: string) => void;
  searchValue: string;
}

export function EmployeesFilters({ onSearch, searchValue }: EmployeesFiltersProps): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        placeholder="Search employees..."
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 300 }}
      />
    </Stack>
  );
}