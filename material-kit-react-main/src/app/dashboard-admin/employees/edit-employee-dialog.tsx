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
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { Employee } from '@/types/employee';

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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (employee) {
      // Create a copy of the employee with only fields defined in the interface
      setFormData({
        ...employee,
        // Use only the Password property since that's what's defined in your interface
        Password: employee.Password || ''
      });
      setError(null);
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

  const handleSelectChange = (field: keyof Employee) => (
    event: SelectChangeEvent
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
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_employee/${formData.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: formData.name,
          gender: formData.gender.toLowerCase(), // Ensure lowercase gender is sent to backend
          phone_number: formData.phone_number,
          address: formData.address,
          Email: formData.Email,
          Password: formData.Password || '' // Include password field
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.errors || 'Failed to update employee');
      }
      
      onSubmit(formData);
    } catch (err) {
      console.error('Error updating employee:', err);
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
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
                  onChange={handleSelectChange('gender')}
                  required
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
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
                  value={formData.Password || ''}
                  onChange={handleChange('Password')}
                  type="password"
                  placeholder="Leave blank to keep current password"
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