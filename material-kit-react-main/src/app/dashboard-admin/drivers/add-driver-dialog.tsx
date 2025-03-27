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
  Snackbar,
  Box,
  SelectChangeEvent  // Add this import
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Car {
  id: string;
  model: string;
  plateNumber: string;
}

export default function AddDriverDialog({
  open,
  onClose,
  onSuccess
}: AddDriverDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState({
    name: '',
    gender: 'male',
    phone_number: '',
    car_id: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [availableCars, setAvailableCars] = React.useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = React.useState(false);
  const [companyId, setCompanyId] = React.useState<string | null>(null);

  // Fetch available cars when dialog opens
  React.useEffect(() => {
    if (open) {
      // Reset form
      setFormData({
        name: '',
        gender: 'male',
        phone_number: '',
        car_id: ''
      });
      setError(null);
      
      // Get company ID from localStorage
      const company_id = localStorage.getItem('company_id') || 
                        localStorage.getItem('companyId') || 
                        localStorage.getItem('employee-company-id');
      
      setCompanyId(company_id);
      
      if (company_id) {
        fetchAvailableCars(company_id);
      } else {
        setError('No company ID found. Please log in again.');
      }
    }
  }, [open]);

  const fetchAvailableCars = (company_id: string) => {
    setLoadingCars(true);
    
    fetch(`https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=company&userId=${company_id}`)
      .then(response => response.json())
      .then(data => {
        // Update this part to match the edit dialog's car mapping
        const cars = data.map((car: any) => ({
          id: car.id,
          model: car.model || car.Model_of_car,  // Handle both naming conventions
          plateNumber: car.plateNumber || car.Plate_number  // Handle both naming conventions
        }));
        
        console.log('Mapped cars:', cars); // Debug log
        setAvailableCars(cars);
        setLoadingCars(false);
      })
      .catch(error => {
        console.error('Error fetching available cars:', error);
        setError('Failed to load available cars');
        setLoadingCars(false);
      });
  };

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Add a new handler for Select components
  const handleSelectChange = (field: string) => (
    event: SelectChangeEvent
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isFormValid()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!companyId) {
        throw new Error('No company ID available. Please log in again.');
      }
      
      // Prepare submission data
      const submissionData = {
        name: formData.name,
        gender: formData.gender,
        phone_number: formData.phone_number,
        company_id: companyId,
        car_id: formData.car_id
      };
      
      const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/create_driver/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
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
        throw new Error(data.error || 'Failed to create driver');
      }
      
      setOpenSnackbar(true);
      onSuccess(); // Notify parent component of successful creation
    } catch (err) {
      console.error('Error creating driver:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.gender !== '' &&
      formData.phone_number.trim() !== '' &&
      !!formData.car_id  // Convert to boolean
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AddIcon />
          <Typography variant="h6">Add New Driver</Typography>
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
                  <FormHelperText>
                    Format: +966xxxxxxxx or 05xxxxxxxx
                  </FormHelperText>
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
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              disabled={!isFormValid() || loading}
            >
              {loading ? 'Adding...' : 'Add Driver'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Driver added successfully
        </Alert>
      </Snackbar>
    </>
  );
}