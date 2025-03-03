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

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddEmployeeDialog({ open, onClose }: AddEmployeeDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [gender, setGender] = React.useState({
    male: false,
    female: false,
  });

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGender({
      ...gender,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add logic to save the employee information
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
        Add Employee
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>First name</InputLabel>
                <OutlinedInput label="First name" name="firstName" />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Last name</InputLabel>
                <OutlinedInput label="Last name" name="lastName" />
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
                <InputLabel>Email address</InputLabel>
                <OutlinedInput label="Email address" name="email" type="email" />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Address</InputLabel>
                <OutlinedInput label="Address" name="address" />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Phone number</InputLabel>
                <OutlinedInput label="Phone number" name="phone" />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Company ID</InputLabel>
                <OutlinedInput label="Company ID" name="companyId" />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Password</InputLabel>
                <OutlinedInput label="Password" name="password" type="password" />
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