import * as React from 'react';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import GradeIcon from '@mui/icons-material/Grade';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import FilterListIcon from '@mui/icons-material/FilterList';

interface Car {
  id: string;
  model: string;
  status: string;
  isActive?: boolean;
  score?: number;
  speed?: number;
}

interface CarsTableProps {
  cars: Car[];
  onSelectCar: (carId: string) => void;
  selectedCar: string | null;
}

export function CarsTable({ cars, onSelectCar, selectedCar }: CarsTableProps): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy?.field === field) {
      setSortBy({
        field,
        direction: sortBy.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortBy({ field, direction: 'asc' });
    }
  };

  // Filter cars based on search term
  const filteredCars = cars.filter(car => 
    car.id.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase()) ||
    car.status.toLowerCase().includes(search.toLowerCase())
  );

  // Sort cars based on sort field and direction
  const sortedCars = sortBy 
    ? [...filteredCars].sort((a, b) => {
        const aValue = a[sortBy.field];
        const bValue = b[sortBy.field];
        
        // Handle undefined or null values
        if (aValue === undefined || aValue === null) return sortBy.direction === 'asc' ? -1 : 1;
        if (bValue === undefined || bValue === null) return sortBy.direction === 'asc' ? 1 : -1;
        
        // Compare values based on type
        if (typeof aValue === 'string') {
          return sortBy.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        } else {
          return sortBy.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
      })
    : filteredCars;

  // Paginate cars
  const paginatedCars = sortedCars.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Function to get score color based on value
  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  // Render sort icon with appropriate direction
  const renderSortIcon = (field: string) => {
    if (sortBy?.field !== field) {
      return <SortIcon fontSize="small" sx={{ opacity: 0.3 }} />;
    }
    
    return sortBy.direction === 'asc' 
      ? <SortIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} /> 
      : <SortIcon fontSize="small" />;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          variant="outlined"
          placeholder="Search vehicles..."
          size="small"
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: '60%' }}
        />
        <Tooltip title="Filter options">
          <IconButton size="small">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 'bold', backgroundColor: '#f5f5f5' } }}>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => handleSort('id')}
                >
                  <DirectionsCarIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="subtitle2">Vehicle ID</Typography>
                  {renderSortIcon('id')}
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => handleSort('model')}
                >
                  <Typography variant="subtitle2">Model</Typography>
                  {renderSortIcon('model')}
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => handleSort('status')}
                >
                  <Typography variant="subtitle2">Status</Typography>
                  {renderSortIcon('status')}
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => handleSort('speed')}
                >
                  <SpeedIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="subtitle2">Speed (km/h)</Typography>
                  {renderSortIcon('speed')}
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => handleSort('score')}
                >
                  <GradeIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="subtitle2">Score</Typography>
                  {renderSortIcon('score')}
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCars.length > 0 ? (
              paginatedCars.map((car) => (
                <TableRow 
                  key={car.id} 
                  onClick={() => onSelectCar(car.id)}
                  hover
                  selected={selectedCar === car.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(74, 144, 226, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(74, 144, 226, 0.2)',
                      }
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircleIcon 
                        sx={{ 
                          fontSize: 10, 
                          mr: 1,
                          color: car.isActive ? 'success.main' : 'grey.400'
                        }} 
                      />
                      {car.id}
                    </Box>
                  </TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>
                    <Chip 
                      label={car.status} 
                      color={car.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontWeight: 500,
                        borderRadius: '4px',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {car.speed !== undefined && car.speed !== null ? (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: car.speed > 80 ? 'error.main' : 
                                 car.speed > 60 ? 'warning.main' : 'inherit'
                        }}
                      >
                        {car.speed}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {car.score !== undefined && car.score !== null ? (
                      <Chip 
                        label={car.score} 
                        color={getScoreColor(car.score)}
                        size="small"
                        sx={{ minWidth: '50px' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No vehicles found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCars.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}