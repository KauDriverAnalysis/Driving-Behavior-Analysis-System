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
import { useState } from 'react';
import { AlertColor } from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddDriverDialog({ 
  open, 
  onClose,
  onSuccess
}: AddDriverDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  });
  
  const [gender, setGender] = React.useState({
    male: false,
    female: false
  });

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (name === 'male' && checked) {
      setGender({ male: true, female: false });
    } else if (name === 'female' && checked) {
      setGender({ male: false, female: true });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formDataObject: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    
    // Add gender data and REMOVE male/female checkbox values
    formDataObject.gender = gender.male ? 'male' : (gender.female ? 'female' : '');
    delete formDataObject.male;
    delete formDataObject.female;
    
    // Ensure company_id is properly formatted
    if (formDataObject.company_id) {
      formDataObject.company_id = parseInt(formDataObject.company_id, 10);
    }
    
    // Ensure car_id is properly formatted
    if (formDataObject.car_id) {
      formDataObject.car_id = parseInt(formDataObject.car_id, 10);
    }
    
    console.log('Form data being sent:', formDataObject);
    
    try {
      const response = await fetch('http://localhost:8000/api/create_driver/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
        credentials: 'include',
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
        message: 'Driver created successfully!',
        severity: 'success'
      });
      
      if (onSuccess) {
        onSuccess(); // Call the success callback
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setAlertState({
        open: true,
        message: `Error: ${error}`,
        severity: 'error'
      });
    }
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
        Add Driver
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Name</InputLabel>
                <OutlinedInput label="Name" name="name" />
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
                <InputLabel>Company ID</InputLabel>
                <OutlinedInput label="Company ID" name="company_id" />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Car ID</InputLabel>
                <OutlinedInput label="Car ID" name="car_id" />
              </FormControl>
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
  );
}