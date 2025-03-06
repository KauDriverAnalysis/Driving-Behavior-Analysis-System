// TimeFilter.tsx
import * as React from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface TimeFilterProps {
  onFilterChange: (timeFrame: '1d' | '7d' | '30d') => void;
  selectedFilter: '1d' | '7d' | '30d';
}

export function TimeFilter({ onFilterChange, selectedFilter }: TimeFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (_: React.MouseEvent<HTMLElement>, newTimeFrame: '1d' | '7d' | '30d') => {
    if (newTimeFrame !== null) {
      onFilterChange(newTimeFrame);
    }
  };

  return (
    <ToggleButtonGroup
      value={selectedFilter}
      exclusive
      onChange={handleChange}
      aria-label="time filter"
      size={isMobile ? "small" : "medium"}
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 1
      }}
    >
      <ToggleButton value="1d" aria-label="1 day">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ mr: { xs: 0, sm: 1 }, fontSize: isMobile ? 'small' : 'medium' }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>1d</Box>
        </Box>
      </ToggleButton>
      <ToggleButton value="7d" aria-label="7 days">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon sx={{ mr: { xs: 0, sm: 1 }, fontSize: isMobile ? 'small' : 'medium' }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>7d</Box>
        </Box>
      </ToggleButton>
      <ToggleButton value="30d" aria-label="30 days">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarViewMonthIcon sx={{ mr: { xs: 0, sm: 1 }, fontSize: isMobile ? 'small' : 'medium' }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>30d</Box>
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}