import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

interface CarCustomer {
  name: string;
  owner: string;
  licensePlate: string;
  model: string;
  status: string;
}

interface AddCarCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (car: CarCustomer) => void;
}

export default function AddCarCustomerDialog({ 
  open, 
  onClose,
  onSubmit 
}: AddCarCustomerDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<CarCustomer>({
    name: '',
    owner: '',
    licensePlate: '',
    model: '',
    status: 'active'
  });

  const handleChange = (field: keyof CarCustomer) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      owner: '',
      licensePlate: '',
      model: '',
      status: 'active'
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          padding: theme.spacing(2),
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
        }}
      >
        Add Car Customer
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Car Name</InputLabel>
                <OutlinedInput 
                  label="Car Name" 
                  value={formData.name}
                  onChange={handleChange('name')}
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>License Plate</InputLabel>
                <OutlinedInput 
                  label="License Plate" 
                  value={formData.licensePlate}
                  onChange={handleChange('licensePlate')}
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
            <Grid item xs={12}>
              <FormControl fullWidth required>
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
        <DialogActions sx={{ justifyContent: 'flex-end', padding: theme.spacing(2) }}>
          <Button onClick={onClose} variant="outlined" sx={{ marginRight: theme.spacing(2) }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.name || !formData.owner || !formData.licensePlate || !formData.model}
          >
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}