import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid,
  Select,
  MenuItem,
  Typography,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

interface FormData {
  name: string;
  gender: string;
  phone_number: string;
  company_id: string;
  car_id: string;
}

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDriverDialog({
  open,
  onClose,
  onSuccess
}: AddDriverDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    gender: '',
    phone_number: '',
    company_id: '',
    car_id: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        gender: '',
        phone_number: '',
        company_id: '',
        car_id: ''
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isFormValid()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/create_driver/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          phone_number: formData.phone_number,
          company_id: formData.company_id,
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
      formData.company_id.trim() !== '' &&
      formData.car_id.trim() !== ''
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
                    onChange={handleChange('gender')}
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Company ID</InputLabel>
                  <OutlinedInput
                    label="Company ID"
                    value={formData.company_id}
                    onChange={handleChange('company_id')}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Car ID</InputLabel>
                  <OutlinedInput
                    label="Car ID"
                    value={formData.car_id}
                    onChange={handleChange('car_id')}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
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
          severity="success" 
          onClose={() => setOpenSnackbar(false)}
        >
          Driver created successfully
        </Alert>
      </Snackbar>
    </>
  );
}