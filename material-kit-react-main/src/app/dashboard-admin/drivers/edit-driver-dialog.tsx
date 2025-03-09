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
  Typography
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
  status: 'active' | 'inactive';
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

  React.useEffect(() => {
    if (driver) {
      setFormData(driver);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
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
        <Typography variant="h6">Edit Driver</Typography>
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
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange('gender')}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
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