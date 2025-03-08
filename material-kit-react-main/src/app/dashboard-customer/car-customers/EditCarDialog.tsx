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
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

interface CarCustomer {
  id: string;
  name: string;
  owner: string;
  licensePlate: string;
  status: string;
  model: string;
}

interface EditCarDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (car: CarCustomer) => void;
  car: CarCustomer | null;
}

export default function EditCarDialog({ 
  open, 
  onClose, 
  onSubmit,
  car 
}: EditCarDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<CarCustomer | null>(null);

  React.useEffect(() => {
    if (car) {
      setFormData(car);
    }
  }, [car]);

  if (!formData || !car) return null;

  const handleChange = (field: keyof CarCustomer) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev!,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
    onClose();
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
              <FormControl fullWidth>
                <InputLabel>Car Name</InputLabel>
                <OutlinedInput
                  label="Car Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Owner</InputLabel>
                <OutlinedInput
                  label="Owner"
                  value={formData.owner}
                  onChange={handleChange('owner')}
                  required
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>License Plate</InputLabel>
                <OutlinedInput
                  label="License Plate"
                  value={formData.licensePlate}
                  onChange={handleChange('licensePlate')}
                  required
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <OutlinedInput
                  label="Model"
                  value={formData.model}
                  onChange={handleChange('model')}
                  required
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleChange('status')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
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