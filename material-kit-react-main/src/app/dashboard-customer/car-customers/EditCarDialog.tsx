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
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { Car } from '@/components/dashboard-customer/car-customers/car-customers-table';

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

  React.useEffect(() => {
    if (car) {
      setFormData(car);
    }
  }, [car]);

  if (!formData || !car) return null;

  const handleChange = (field: keyof Car) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev!,
      [field]: field === 'Release_Year_car' ? Number(value) : value
    }));
  };

  const handleSelectChange = (field: keyof Car) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({
      ...prev!,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
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
        <Typography variant="h6" component="span">
          Edit Car Information
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Model</InputLabel>
                <OutlinedInput
                  label="Model"
                  value={formData.Model_of_car}
                  onChange={handleChange('Model_of_car')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <OutlinedInput
                  label="Type"
                  value={formData.TypeOfCar}
                  onChange={handleChange('TypeOfCar')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Plate Number</InputLabel>
                <OutlinedInput
                  label="Plate Number"
                  value={formData.Plate_number}
                  onChange={handleChange('Plate_number')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Release Year</InputLabel>
                <OutlinedInput
                  label="Release Year"
                  type="number"
                  value={formData.Release_Year_car}
                  onChange={handleChange('Release_Year_car')}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.State_of_car}
                  label="State"
                  onChange={handleSelectChange('State_of_car')}
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Device ID</InputLabel>
                <OutlinedInput
                  label="Device ID"
                  value={formData.device_id}
                  onChange={handleChange('device_id')}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            startIcon={<EditIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}