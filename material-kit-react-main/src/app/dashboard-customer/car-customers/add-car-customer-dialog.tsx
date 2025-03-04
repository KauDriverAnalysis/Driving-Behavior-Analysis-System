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

interface AddCarCustomerDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddCarCustomerDialog({ open, onClose }: AddCarCustomerDialogProps): React.JSX.Element {
  const theme = useTheme();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add logic to save the car customer information
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
                <OutlinedInput label="Car Name" name="carName" />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Owner</InputLabel>
                <OutlinedInput label="Owner" name="owner" />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>License Plate</InputLabel>
                <OutlinedInput label="License Plate" name="licensePlate" />
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