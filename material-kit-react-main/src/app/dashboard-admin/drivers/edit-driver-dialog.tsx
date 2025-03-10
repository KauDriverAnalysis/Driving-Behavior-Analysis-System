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
  CircularProgress
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
  const [formData, setFormData] = React.useState<Driver | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (driver) {
      setFormData(driver);
      setError(null);
    }
  }, [driver]);

  if (!formData || !driver) return null;

  const handleChange = (field: keyof Driver) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev!,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Call API directly from dialog
      const response = await fetch(`http://localhost:8000/api/update_driver/${formData.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender.toLowerCase(), // Ensure lowercase gender is sent to backend
          phone_number: formData.phone_number,
          company_id: formData.company_id,
          car_id: formData.car_id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update driver');
      }
      
      onSubmit(formData);
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