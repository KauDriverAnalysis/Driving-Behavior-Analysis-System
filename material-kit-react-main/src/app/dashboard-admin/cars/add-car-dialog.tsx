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
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

interface AddCarDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CarFormData) => void;
}

interface CarFormData {
  name: string;
  brand: string;
  model: string;
  year: string;
  plate_number: string;
  owner: string;
  // Removed status from form
}

export default function AddCarDialog({ open, onClose, onSubmit }: AddCarDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<CarFormData>({
    name: '',
    brand: '',
    model: '',
    year: '',
    plate_number: '',
    owner: ''
  });

  const handleChange = (field: keyof CarFormData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add default inactive status when submitting
    onSubmit({ ...formData, status: 'inactive' as const });
    setFormData({
      name: '',
      brand: '',
      model: '',
      year: '',
      plate_number: '',
      owner: ''
    });
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value !== '');
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Brand</InputLabel>
                <OutlinedInput
                  label="Brand"
                  value={formData.brand}
                  onChange={handleChange('brand')}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Model</InputLabel>
                <OutlinedInput
                  label="Model"
                  value={formData.model}
                  onChange={handleChange('model')}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Year</InputLabel>
                <OutlinedInput
                  label="Year"
                  value={formData.year}
                  onChange={handleChange('year')}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Plate Number</InputLabel>
                <OutlinedInput
                  label="Plate Number"
                  value={formData.plate_number}
                  onChange={handleChange('plate_number')}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Owner</InputLabel>
                <OutlinedInput
                  label="Owner"
                  value={formData.owner}
                  onChange={handleChange('owner')}
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
            disabled={!isFormValid()}
            startIcon={<AddIcon />}
          >
            Add Car
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}