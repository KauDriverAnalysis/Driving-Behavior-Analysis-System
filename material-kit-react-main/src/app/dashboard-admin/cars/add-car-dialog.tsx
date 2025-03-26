import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

interface AddCarDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CarFormData {
  Model_of_car: string;
  TypeOfCar: string;
  Plate_number: string;
  Release_Year_car: number;
  State_of_car: 'online' | 'offline';
  device_id: string;
  company_id: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

export default function AddCarDialog({ open, onClose, onSuccess }: AddCarDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<CarFormData>({
    Model_of_car: '',
    TypeOfCar: '',
    Plate_number: '',
    Release_Year_car: new Date().getFullYear(),
    State_of_car: 'offline',
    device_id: '',
    company_id: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({});

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        Model_of_car: '',
        TypeOfCar: '',
        Plate_number: '',
        Release_Year_car: new Date().getFullYear(),
        State_of_car: 'offline',
        device_id: '',
        company_id: ''
      });
      setError(null);
      setValidationErrors({});
    }
  }, [open]);

  const handleChange = (field: keyof CarFormData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'Release_Year_car' ? Number(value) : value
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isFormValid()) return;
    
    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      // First check what type of user is logged in
      const userType = localStorage.getItem('userType') || localStorage.getItem('user-type');
      let customerId = null;
      let companyId = null;
      
      if (userType === 'employee' || userType === 'admin') {
        // For employees, get company ID
        companyId = localStorage.getItem('company_id') || 
                   localStorage.getItem('employee-company-id') || 
                   localStorage.getItem('companyId');
        
        if (!companyId) {
          setError('No company ID found. Please log in again.');
          return;
        }
      } else {
        // For customers, get customer ID
        customerId = localStorage.getItem('customer-id');
        
        if (!customerId) {
          setError('No customer ID found. Please log in again.');
          return;
        }
      }
      
      // Only include the IDs that are not null
      const apiData = {
        Model_of_car: formData.Model_of_car,
        TypeOfCar: formData.TypeOfCar,
        Plate_number: formData.Plate_number,
        Release_Year_car: formData.Release_Year_car,
        State_of_car: formData.State_of_car,
        device_id: formData.device_id
      };

      // Only add customer_id if it exists
      if (customerId) {
        apiData.customer_id = customerId;
      }

      // Only add company_id if it exists
      if (companyId) {
        apiData.company_id = companyId;
      }
      
      const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/create_car/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.log('Response error:', data);
        
        if (data.errors) {
          setValidationErrors(data.errors);
          return;
        }
        
        throw new Error(data.error || data.message || 'Failed to create car');
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error creating car:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.Model_of_car.trim() !== '' &&
      formData.TypeOfCar.trim() !== '' &&
      formData.Plate_number.trim() !== '' &&
      formData.Release_Year_car > 0 &&
      formData.device_id.trim() !== ''
    );
  };

  const validatePlateNumber = (plateNumber: string): boolean => {
    // Plate number should be 3 letters followed by 4 digits
    const regex = /^[A-Za-z]{3}\s?\d{4}$/;
    return regex.test(plateNumber);
  };

  return (
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
        <Typography variant="h6">Add New Car</Typography>
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
              <FormControl fullWidth required error={!!validationErrors.Model_of_car}>
                <InputLabel>Model</InputLabel>
                <OutlinedInput
                  label="Model"
                  value={formData.Model_of_car}
                  onChange={handleChange('Model_of_car')}
                />
                {validationErrors.Model_of_car && (
                  <FormHelperText error>{validationErrors.Model_of_car[0]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!validationErrors.TypeOfCar}>
                <InputLabel>Type</InputLabel>
                <OutlinedInput
                  label="Type"
                  value={formData.TypeOfCar}
                  onChange={handleChange('TypeOfCar')}
                />
                {validationErrors.TypeOfCar && (
                  <FormHelperText error>{validationErrors.TypeOfCar[0]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.Plate_number}>
                <InputLabel>Plate Number</InputLabel>
                <OutlinedInput
                  label="Plate Number"
                  value={formData.Plate_number}
                  onChange={handleChange('Plate_number')}
                  placeholder="ABC 1234"
                />
                {validationErrors.Plate_number && (
                  <FormHelperText error>{validationErrors.Plate_number[0]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.Release_Year_car}>
                <InputLabel>Release Year</InputLabel>
                <OutlinedInput
                  label="Release Year"
                  type="number"
                  value={formData.Release_Year_car}
                  onChange={handleChange('Release_Year_car')}
                />
                {validationErrors.Release_Year_car && (
                  <FormHelperText error>{validationErrors.Release_Year_car[0]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.State_of_car}>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.State_of_car}
                  label="State"
                  onChange={handleChange('State_of_car')}
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
                {validationErrors.State_of_car && (
                  <FormHelperText error>{validationErrors.State_of_car[0]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.device_id}>
                <InputLabel>Device ID</InputLabel>
                <OutlinedInput
                  label="Device ID"
                  value={formData.device_id}
                  onChange={handleChange('device_id')}
                />
                {validationErrors.device_id && (
                  <FormHelperText error>{validationErrors.device_id[0]}</FormHelperText>
                )}
                {!validationErrors.device_id && (
                  <FormHelperText>
                    Device ID is required and must be unique
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Company field removed - will be auto-filled from login info */}
            
            {/* Display validation info */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                <strong>Validation Rules:</strong>
                <ul style={{ margin: '5px 0 5px 20px', padding: 0 }}>
                  <li>Plate Number: 3 letters followed by 4 digits (e.g., "ABC 1234")</li>
                  <li>Device ID: Required and must be unique</li>
                </ul>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Adding...' : 'Add Car'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}