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

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Optional callback for when an employee is successfully added
}

export default function AddEmployeeDialog({ 
  open, 
  onClose,
  onSuccess 
}: AddEmployeeDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [gender, setGender] = React.useState({
    male: false,
    female: false,
  });
  const [alertState, setAlertState] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGender({
      ...gender,
      [event.target.name]: event.target.checked,
    });
  };

  const closeAlert = () => {
    setAlertState({ ...alertState, open: false });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target as HTMLFormElement);
    const formDataObject: any = {};
    
    // Convert FormData to a plain object
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    
    // Add gender data
    formDataObject.gender = gender.male ? 'male' : (gender.female ? 'female' : '');
    
    // Format address if needed
    if (formDataObject.address) {
      // Ensure consistent format with commas
      formDataObject.address = formDataObject.address.trim();
      
      // If address doesn't contain commas, assume it's just a city for simplicity
      if (!formDataObject.address.includes(',')) {
        formDataObject.address = `${formDataObject.address},,,`; // city,state,country,street
      }
    }
    
    
    console.log('Form data being sent:', formDataObject);
    console.log('CSRF token:', getCsrfToken());
    
    try {
      const response = await fetch('http://localhost:8000/api/create_employee/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(formDataObject),
        credentials: 'include', // Important for cookies/CSRF
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
        setAlertState({
          open: true,
          message: `Error: ${JSON.stringify(errorData.errors || errorData.error || 'Unknown error')}`,
          severity: 'error'
        });
        return;
      }
      
      const result = await response.json();
      console.log('Success:', result);
      setAlertState({
        open: true,
        message: 'Employee created successfully!',
        severity: 'success'
      });
      
      setGender({ male: false, female: false });
      (event.target as HTMLFormElement).reset();
      
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error:', error);
      setAlertState({
        open: true,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  const getCsrfToken = () => {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return '';
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
                  <OutlinedInput label="Name" name="Name" />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth required>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={gender.male}
                            onChange={handleGenderChange}
                            name="male"
                            color="primary"
                          />
                        }
                        label="Male"
                      />
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={gender.female}
                            onChange={handleGenderChange}
                            name="female"
                            color="primary"
                          />
                        }
                        label="Female"
                      />
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Phone number</InputLabel>
                  <OutlinedInput label="Phone number" name="phone_number" />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Address</InputLabel>
                  <OutlinedInput label="Address" name="address" placeholder="City, State, Country, Street" />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput label="Email" name="Email" type="email" />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput label="Password" name="Password" type="password" />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', padding: theme.spacing(2) }}>
            <Button onClick={onClose} variant="outlined" sx={{ marginRight: theme.spacing(2) }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
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