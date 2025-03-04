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
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface AddCarDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddCarDialog({ open, onClose }: AddCarDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formDataObject: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    
    // Auto-convert plate number to uppercase
    if (formDataObject.Plate_number) {
      formDataObject.Plate_number = formDataObject.Plate_number.toUpperCase();
    }

    console.log('Form data being sent:', formDataObject);
    
    try {
      const response = await fetch('http://localhost:8000/api/create_car/', {
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
        message: 'Car created successfully!',
        severity: 'success'
      });
      
      onClose();
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
        Add Car
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Car Model</InputLabel>
                <OutlinedInput label="Car Model" name="Model_of_car" />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <OutlinedInput label="Type" name="TypeOfCar" />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Plate Number</InputLabel>
                <OutlinedInput 
                  label="Plate Number" 
                  name="Plate_number" 
                />
                <FormHelperText>Format: ABC 1234 (3 uppercase letters, space, 4 digits)</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Release Year</InputLabel>
                <OutlinedInput 
                  label="Release Year" 
                  name="Release_Year_car" 
                  type="number" 
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="State_of_car"
                  label="Status"
                  defaultValue=""
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Device ID</InputLabel>
                <OutlinedInput label="Device ID" name="device_id" />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer ID</InputLabel>
                <OutlinedInput label="Customer ID" name="customer_id" />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Company ID</InputLabel>
                <OutlinedInput label="Company ID" name="company_id" />
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