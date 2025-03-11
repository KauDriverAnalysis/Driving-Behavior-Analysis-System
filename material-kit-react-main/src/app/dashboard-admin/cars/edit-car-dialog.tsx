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
  Typography,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

interface Car {
  id: string;
  model: string;      // Model_of_car in backend
  type: string;       // TypeOfCar in backend
  plateNumber: string; // Plate_number in backend
  releaseYear: number; // Release_Year_car in backend
  state: 'online' | 'offline'; // State_of_car in backend
  deviceId: string;   // device_id in backend
  customerId?: number | null; // customer_id FK
  companyId?: number | null; // company_id FK
}

interface EditCarDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (car: Car) => void;
  car: Car | null;
}

export default function EditCarDialog({
  open,
  onClose,
  onSubmit,
  car
}: EditCarDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<Car | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (car) {
      setFormData({...car});
      setError(null);
    }
  }, [car]);

  if (!formData || !car) return null;

  const handleChange = (field: keyof Car) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev!,
      [field]: field === 'releaseYear' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Remove direct API call, just pass the data to parent component
      onSubmit(formData);
    } catch (err) {
      console.error('Error updating car:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
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
        <EditIcon />
        <Typography variant="h6">Edit Car</Typography>
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
                <InputLabel>Model</InputLabel>
                <OutlinedInput
                  label="Model"
                  value={formData.model}
                  onChange={handleChange('model')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <OutlinedInput
                  label="Type"
                  value={formData.type}
                  onChange={handleChange('type')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Plate Number</InputLabel>
                <OutlinedInput
                  label="Plate Number"
                  value={formData.plateNumber}
                  onChange={handleChange('plateNumber')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Release Year</InputLabel>
                <OutlinedInput
                  label="Release Year"
                  type="number"
                  value={formData.releaseYear}
                  onChange={handleChange('releaseYear')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.state}
                  label="State"
                  onChange={handleChange('state')}
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Device ID</InputLabel>
                <OutlinedInput
                  label="Device ID"
                  value={formData.deviceId}
                  onChange={handleChange('deviceId')}
                />
              </FormControl>
            </Grid>
            
            {/* Company ID field removed as requested */}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
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