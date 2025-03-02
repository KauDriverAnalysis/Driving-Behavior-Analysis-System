import * as React from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

export default function AddEmployee(): React.JSX.Element {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard/employees');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add logic to save the employee information
    handleBack();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Add a new employee" title="Add Employee" />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>First name</InputLabel>
              <OutlinedInput label="First name" name="firstName" />
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Last name</InputLabel>
              <OutlinedInput label="Last name" name="lastName" />
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Email address</InputLabel>
              <OutlinedInput label="Email address" name="email" type="email" />
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Phone number</InputLabel>
              <OutlinedInput label="Phone number" name="phone" />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={handleBack} variant="outlined">Back</Button>
          <Button type="submit" variant="contained">Add</Button>
        </CardActions>
      </Card>
    </form>
  );
}