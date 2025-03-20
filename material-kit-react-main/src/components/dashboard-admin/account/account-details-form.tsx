'use client';

import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface UserData {
  Company_name: string;
  Contact_number: string;
  Email: string;
  location: string;
  Password: string;
  reset_token?: string | null;
  reset_token_expires?: string | null;
}

export function AccountDetailsForm(): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userData, setUserData] = useState<UserData>({
    Company_name: '',
    Contact_number: '',
    Email: '',
    location: '',
    Password: '',
    reset_token: null,
    reset_token_expires: null
  });
  const [tempData, setTempData] = useState<UserData>(userData);

  const handleInputChange = (field: keyof UserData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(userData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData(userData);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Add your API call here to save the data
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tempData)
      // });
      
      // Simulating API call success
      setUserData(tempData);
      setIsEditing(false);
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to update profile', type: 'error' });
    }
  };

  return (
    <>
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader 
            subheader={isEditing ? "Edit company information" : "Company information"} 
            title="Company Profile" 
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Company Name</InputLabel>
                  <OutlinedInput
                    value={tempData.Company_name}
                    onChange={handleInputChange('Company_name')}
                    label="Company Name"
                    name="Company_name"
                    disabled={!isEditing}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Contact Number</InputLabel>
                  <OutlinedInput
                    value={tempData.Contact_number}
                    onChange={handleInputChange('Contact_number')}
                    label="Contact Number"
                    name="Contact_number"
                    type="tel"
                    disabled={!isEditing}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput
                    value={tempData.Email}
                    onChange={handleInputChange('Email')}
                    label="Email"
                    name="Email"
                    type="email"
                    disabled={!isEditing}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Location</InputLabel>
                  <OutlinedInput
                    value={tempData.location}
                    onChange={handleInputChange('location')}
                    label="Location"
                    name="location"
                    disabled={!isEditing}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
            {!isEditing ? (
              <Button
                variant="contained"
                onClick={handleEdit}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Save Changes
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      </form>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}