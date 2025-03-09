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
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  plate_number: string;
  owner: string;
  status: 'active' | 'inactive';
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

  React.useEffect(() => {
    if (car) {
      // Keep all car data including status, but don't show it in the form
      setFormData(car);
    }
  }, [car]);

  if (!formData || !car) return null;

  const handleChange = (field: keyof Car) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev!,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData) {
      // Preserve the existing status when submitting
      onSubmit({ ...formData, status: car?.status || 'inactive' });
    }
    onClose();
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
            startIcon={<EditIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}