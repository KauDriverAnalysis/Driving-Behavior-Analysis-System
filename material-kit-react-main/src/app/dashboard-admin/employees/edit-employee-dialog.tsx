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
  Typography,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

interface Employee {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
  address: string;
  Email: string;
  password: string;  // Added password field
}

interface EditEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: Employee) => void;
  employee: Employee | null;
}

export default function EditEmployeeDialog({ 
  open, 
  onClose, 
  onSubmit,
  employee 
}: EditEmployeeDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  if (!formData || !employee) return null;

  const handleChange = (field: keyof Employee) => (
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
          Edit Employee Information
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Name</InputLabel>
                <OutlinedInput
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange('gender')}
                  required
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange('phone_number')}
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Address</InputLabel>
                <OutlinedInput
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Email</InputLabel>
                <OutlinedInput
                  label="Email"
                  value={formData.Email}
                  onChange={handleChange('Email')}
                  required
                  type="email"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  label="Password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  type="password"
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