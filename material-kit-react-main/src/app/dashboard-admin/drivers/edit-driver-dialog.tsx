import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Box,
  SelectChangeEvent  // Add this import
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

interface Driver {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  company_id: string;
  car_id: string;
}

interface Car {
  id: string;
  model: string;
  plateNumber: string;
}

interface EditDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (driver: Driver) => void;
  driver: Driver | null;
}

export default function EditDriverDialog({
  open,
  onClose,
  onSubmit,
  driver
}: EditDriverDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<Driver>({
    id: '',
    name: '',
    gender: '',
    phone_number: '',
    company_id: '',
    car_id: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [availableCars, setAvailableCars] = React.useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = React.useState(false);
  const [companyId, setCompanyId] = React.useState<string | null>(null);

  // Initialize form data when driver props change
  React.useEffect(() => {
    if (driver) {
      setFormData(driver);
    }
  }, [driver]);

  // Fetch available cars when dialog opens
  React.useEffect(() => {
    if (open && driver) {
      // Get company ID from localStorage
      const company_id = localStorage.getItem('company_id') || 
                         localStorage.getItem('companyId') || 
                         localStorage.getItem('employee-company-id');
      
      setCompanyId(company_id);
      setFormData(prev => ({
        ...prev,
        company_id: company_id || prev.company_id // Keep the existing value if no company_id in localStorage
      }));
      
      if (company_id) {
        fetchAvailableCars(company_id);
      } else {
        setError('No company ID found. Please log in again.');
      }
    }
  }, [open, driver]);

  const fetchAvailableCars = (company_id: string) => {
    setLoadingCars(true);
    
    // Fetch cars that belong to this company
    fetch(`https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=company&userId=${company_id}`)
      .then(response => response.json())
      .then(data => {
        // Format cars for dropdown
        const cars = data.map((car: any) => ({
          id: car.id,
          model: car.model || car.Model_of_car,
          plateNumber: car.plateNumber || car.Plate_number
        }));
        
        setAvailableCars(cars);
        setLoadingCars(false);
      })
      .catch(error => {
        console.error('Error fetching available cars:', error);
        setError('Failed to load available cars');
        setLoadingCars(false);
      });
  };

  const handleChange = (field: keyof Driver) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Add this new handler for Select components
  const handleSelectChange = (field: keyof Driver) => (
    event: SelectChangeEvent
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Ensure we're using the company ID from localStorage
      if (!companyId) {
        throw new Error('No company ID available. Please log in again.');
      }
      
      // Call API directly from dialog
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_driver/${formData.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender.toLowerCase(), // Ensure lowercase gender is sent to backend
          phone_number: formData.phone_number,
          company_id: companyId, // Use company ID from localStorage
          car_id: formData.car_id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          // Format error message from backend
          const errorMessages = [];
          for (const field in data.errors) {
            errorMessages.push(`${field}: ${data.errors[field].join(', ')}`);
          }
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(data.error || 'Failed to update driver');
      }
      
      onSubmit({
        ...formData,
        company_id: companyId // Ensure the company ID is updated in the local state too
      });
    } catch (err) {
      console.error('Error updating driver:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          py: 2
        }}
      >
        <EditIcon />
        <Typography variant="h6">Edit Driver</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Name</InputLabel>
                <OutlinedInput
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleSelectChange('gender')}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange('phone_number')}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Car</InputLabel>
                <Select
                  value={formData.car_id}
                  label="Car"
                  onChange={handleSelectChange('car_id')}
                  disabled={loadingCars}
                >
                  {availableCars.map(car => (
                    <MenuItem key={car.id} value={car.id}>
                      {car.model} - {car.plateNumber}
                    </MenuItem>
                  ))}
                </Select>
                {loadingCars && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="caption">Loading available cars...</Typography>
                  </Box>
                )}
                {!loadingCars && availableCars.length === 0 && !error && (
                  <FormHelperText error>
                    No cars available for your company. Please add a car first.
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}