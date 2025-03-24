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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Optional callback for when an employee is successfully added
}

interface FormData {
  name: string;
  phone_number: string;
  address: string;
  Email: string;
  Password: string;
}

interface ValidationErrors {
  phone_number?: string;
}

// Update the component to include form validation
export default function AddEmployeeDialog({ 
  open, 
  onClose,
  onSuccess 
}: AddEmployeeDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [gender, setGender] = React.useState('');
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    phone_number: '',
    address: '',
    Email: '',
    Password: ''
  });
  const [alertState, setAlertState] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Add validation errors state
  const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({});

  // Update your touched state to include gender
  const [touched, setTouched] = React.useState({
    name: false,
    phone_number: false,
    address: false,
    Email: false,
    Password: false,
    gender: false
  });

  // Phone number validation function
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Simple regex for phone number validation
    const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phoneNumber);
  };

  // Update the handleInputChange function
  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate phone number if that's the field being changed
    if (field === 'phone_number' && value.trim() !== '') {
      if (!validatePhoneNumber(value)) {
        setValidationErrors(prev => ({
          ...prev,
          phone_number: 'Please enter a valid phone number'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          phone_number: undefined
        }));
      }
    }
  };

  // Add a function to handle blur events
  const handleBlur = (field: keyof FormData) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate phone number on blur
    if (field === 'phone_number' && formData.phone_number.trim() !== '') {
      if (!validatePhoneNumber(formData.phone_number)) {
        setValidationErrors(prev => ({
          ...prev,
          phone_number: 'Please enter a valid phone number'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          phone_number: undefined
        }));
      }
    }
  };

  const isFormValid = () => {
    // Check if all required fields are filled AND there are no validation errors
    return (
      formData.name.trim() !== '' &&
      formData.phone_number.trim() !== '' &&
      validatePhoneNumber(formData.phone_number) && // Check if phone number is valid
      formData.address.trim() !== '' &&
      formData.Email.trim() !== '' &&
      formData.Password.trim() !== '' &&
      gender !== ''
    );
  };

  const handleGenderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setGender(event.target.value as string);
  };

  const closeAlert = () => {
    setAlertState({ ...alertState, open: false });
  };

  // Update the handleSubmit function
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted"); // Debug log
    
    // Mark all fields as touched on submit attempt
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field as keyof FormData] = true;
      return acc;
    }, {} as Record<keyof FormData, boolean>);
    
    setTouched(allTouched);
    
    // Validate phone number again before submission
    if (!validatePhoneNumber(formData.phone_number)) {
      setValidationErrors(prev => ({
        ...prev,
        phone_number: 'Please enter a valid phone number'
      }));
      return;
    }
    
    if (!isFormValid()) {
      console.log("Form validation failed:", { formData, gender }); // Debug log
      return; // Don't submit if form is invalid
    }
    
    // Get company ID from localStorage with multiple fallbacks
    const companyId = localStorage.getItem('company_id') || 
                     localStorage.getItem('employee-company-id') || 
                     localStorage.getItem('companyId');
    
    if (!companyId) {
      console.error('No company ID found in localStorage');
      setAlertState({
        open: true,
        message: 'Error: Company ID not found. Please log in again.',
        severity: 'error'
      });
      return;
    }
    
    // Create payload directly from React state plus company ID
    const payload = {
      Name: formData.name,
      gender: gender,
      phone_number: formData.phone_number,
      address: formData.address,
      Email: formData.Email,
      Password: formData.Password,
      company_id: companyId // Add company ID to payload
    };
    
    console.log('Payload being sent:', payload); // Debug log
    
    try {
      const response = await fetch('http://localhost:8000/api/create_employee/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log("Response status:", response.status); // Debug log
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (!response.ok) {
        console.error('Error:', data);
        setAlertState({
          open: true,
          message: `Error: ${JSON.stringify(data.errors || data.error || 'Unknown error')}`,
          severity: 'error'
        });
        return;
      }
      
      // Success path
      setAlertState({
        open: true,
        message: 'Employee created successfully!',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        phone_number: '',
        address: '',
        Email: '',
        Password: ''
      });
      setGender('');
      setTouched({
        name: false,
        phone_number: false,
        address: false,
        Email: false,
        Password: false,
        gender: false
      });
      setValidationErrors({});
      
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Network error:', error);
      setAlertState({
        open: true,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  return (
    <>
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
          Add Employee
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Name</InputLabel>
                  <OutlinedInput 
                    label="Name" 
                    name="Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && formData.name.trim() === ''}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={touched.gender && !gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={gender}
                    onChange={handleGenderChange}
                    label="Gender"
                    name="gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={
                    (touched.phone_number && formData.phone_number.trim() === '') ||
                    Boolean(validationErrors.phone_number)
                  }
                >
                  <InputLabel>Phone number</InputLabel>
                  <OutlinedInput 
                    label="Phone number" 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange('phone_number')}
                    onBlur={handleBlur('phone_number')}
                    placeholder="e.g., 05XX-XXX-XXXX"
                  />
                  {validationErrors.phone_number && (
                    <FormHelperText error>{validationErrors.phone_number}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Address</InputLabel>
                  <OutlinedInput 
                    label="Address" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    onBlur={handleBlur('address')}
                    error={touched.address && formData.address.trim() === ''}
                    placeholder="City, State, Country, Street"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput 
                    label="Email" 
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleInputChange('Email')}
                    onBlur={handleBlur('Email')}
                    error={touched.Email && formData.Email.trim() === ''}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput 
                    label="Password" 
                    name="Password"
                    type="password"
                    value={formData.Password}
                    onChange={handleInputChange('Password')}
                    onBlur={handleBlur('Password')}
                    error={touched.Password && formData.Password.trim() === ''}
                  />
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
              disabled={!isFormValid()}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={closeAlert}>
        <Alert onClose={closeAlert} severity={alertState.severity} sx={{ width: '100%' }}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </>
  );
}