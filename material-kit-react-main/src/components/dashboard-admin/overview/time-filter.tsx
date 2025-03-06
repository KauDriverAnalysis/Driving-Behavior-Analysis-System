import * as React from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

interface TimeFilterProps {
  onFilterChange: (timeFrame: '1d' | '7d' | '30d') => void;
  selectedFilter: '1d' | '7d' | '30d';
}

export function TimeFilter({ onFilterChange, selectedFilter }: TimeFilterProps) {
  return (
    <ButtonGroup variant="contained">
      <Button 
        onClick={() => onFilterChange('1d')}
        color={selectedFilter === '1d' ? 'primary' : 'inherit'}
      >
        1d
      </Button>
      <Button 
        onClick={() => onFilterChange('7d')}
        color={selectedFilter === '7d' ? 'primary' : 'inherit'}
      >
        7d
      </Button>
      <Button 
        onClick={() => onFilterChange('30d')}
        color={selectedFilter === '30d' ? 'primary' : 'inherit'}
      >
        30d
      </Button>
    </ButtonGroup>
  );
}