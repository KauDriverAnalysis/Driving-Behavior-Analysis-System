'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';

interface UserData {
  Name: string;
  gender: 'male' | 'female';
  phone_number: string;
  address: string | null;
  Email: string;
  Password?: string;
}

export function AccountDetailsForm(): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userData, setUserData] = useState<UserData>({
    Name: '',
    gender: 'male',
    phone_number: '',
    address: '',
    Email: '',
  });
  const [tempData, setTempData] = useState<UserData>(userData);
  const [loading, setLoading] = useState(true);
  
  // Get customer ID from localStorage - check both formats (with hyphen and camelCase)
  const directCustomerId = localStorage.getItem('customerId');
  const hyphenCustomerId = localStorage.getItem('customer-id'); 
  const userId = localStorage.getItem('userId');
  const tokenParts = localStorage.getItem('token')?.split('_');
  const customerIdFromToken = tokenParts && tokenParts.length > 0 ? tokenParts[0] : null;
  
  // Try all possible sources with fallback to a hardcoded ID for testing
  const customerId = directCustomerId || 
                    hyphenCustomerId ||
                    (userId && userId.startsWith('R') ? userId.substring(1) : null) ||
                    customerIdFromToken || 
                    '1'; // Hardcoded ID for testing - change to a valid ID
  
  // Debug logging
  useEffect(() => {
    console.log('AccountDetailsForm - Customer ID debugging:');
    console.log('directCustomerId:', directCustomerId);
    console.log('Effective customerId being used:', customerId);
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`- ${key}: ${localStorage.getItem(key)}`);
      }
    }
  }, [directCustomerId, customerId]);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!customerId) {
          console.log('No customer ID found, skipping data fetch');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log(`Fetching customer data for ID: ${customerId}`);
        
        
        // Call the get_customer endpoint
        const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/customer/${customerId}/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }
        
        const data = await response.json();
        console.log('Fetched customer data:', data);
        
        // Update state with fetched data
        setUserData({
          Name: data.Name,
          gender: data.gender || 'male',
          phone_number: data.phone_number,
          address: data.address,
          Email: data.Email,
        });
        
        setTempData({
          Name: data.Name,
          gender: data.gender || 'male',
          phone_number: data.phone_number,
          address: data.address,
          Email: data.Email,
        });
        
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setNotification({ message: 'Failed to load customer data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [customerId]);

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
    
    if (!customerId) {
      setNotification({ message: 'Customer ID not found', type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Add Password field to comply with backend requirements
      const dataToSend = {
        ...tempData,
        Password: "dummyPassword123" // This is a workaround - the backend will ignore this value
      };
      
      console.log(`Updating customer ${customerId} with data:`, dataToSend);
      
      // Call update_customer endpoint
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_customer/${customerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'Failed to update profile');
      }
      
      const updatedData = await response.json();
      console.log('Customer update successful:', updatedData);
      
      // Update the local state with the response data
      setUserData({
        Name: updatedData.Name,
        gender: updatedData.gender || 'male',
        phone_number: updatedData.phone_number,
        address: updatedData.address,
        Email: updatedData.Email,
      });
      
      setIsEditing(false);
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating customer:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <Card sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <>
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader 
            subheader={isEditing ? "Edit your profile information" : "Your profile information"} 
            title="Profile" 
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Name</InputLabel>
                  <OutlinedInput
                    value={tempData.Name}
                    onChange={handleInputChange('Name')}
                    label="Name"
                    name="Name"
                    disabled={!isEditing}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={tempData.gender}
                    onChange={(e) => setTempData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                    label="Gender"
                    name="gender"
                    disabled={!isEditing}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
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
                  <InputLabel>Phone Number</InputLabel>
                  <OutlinedInput
                    value={tempData.phone_number}
                    onChange={handleInputChange('phone_number')}
                    label="Phone Number"
                    name="phone_number"
                    type="tel"
                    disabled={!isEditing}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Address</InputLabel>
                  <OutlinedInput
                    value={tempData.address || ''}
                    onChange={handleInputChange('address')}
                    label="Address"
                    name="address"
                    multiline
                    rows={2}
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
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      </form>

      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 2000,
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 4,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '80%'
          }}
        >
          {notification.message}
        </div>
      )}
    </>
  );
}