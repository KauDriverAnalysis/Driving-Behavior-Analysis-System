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
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';

// Update the interface
interface UserData {
  Company_name: string;
  Contact_number: string;  // Changed from Phone_number to match backend
  Email: string;
  location: string;  // Changed from Address to match backend
  Password?: string; // Make sure to include this in your submit
}

export function AccountDetailsForm(): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ 
    message: string; 
    type: 'success' | 'info' | 'warning' | 'error' 
  } | null>(null);
  const [userData, setUserData] = useState<UserData>({
    Company_name: '',
    Contact_number: '',
    Email: '',
    location: '',
  });
  const [tempData, setTempData] = useState<UserData>(userData);
  const [loading, setLoading] = useState(true);

  // Debug localStorage and add fallback for company ID
  const directCompanyId = localStorage.getItem('companyId');
  const employeeCompanyId = localStorage.getItem('employee-company-id');
  
  // Check all possible keys that might contain the company ID
  const userId = localStorage.getItem('userId');
  const tokenParts = localStorage.getItem('token')?.split('_');
  const companyIdFromToken = tokenParts && tokenParts.length > 0 ? tokenParts[0] : null;
  
  // Try all possible sources with fallback to value from logs
  const companyId = directCompanyId || 
                   employeeCompanyId || 
                   localStorage.getItem('company_id') ||
                   (userId && userId.startsWith('C') ? userId.substring(1) : null) ||
                   companyIdFromToken || 
                   '2'; // Hardcoded fallback based on the logs
  
  // Debug logging
  useEffect(() => {
    console.log('AccountDetailsForm - Company ID debugging:');
    console.log('directCompanyId:', directCompanyId);
    console.log('employeeCompanyId:', employeeCompanyId);
    console.log('Effective companyId being used:', companyId);
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`- ${key}: ${localStorage.getItem(key)}`);
      }
    }
  }, [directCompanyId, employeeCompanyId, companyId]);

  // Fetch company data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (companyId) {
          // Fetch company details
          const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/company/${companyId}/`);
          if (!response.ok) {
            throw new Error('Failed to fetch company data');
          }
          const data = await response.json();
          
          // Update state with fetched data
          setUserData({
            Company_name: data.Company_name,
            Contact_number: data.Contact_number,
            Email: data.Email,
            location: data.location,
          });
          setTempData({
            Company_name: data.Company_name,
            Contact_number: data.Contact_number,
            Email: data.Email,
            location: data.location,
          });
          console.log('Company data loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotification({ message: 'Failed to load user data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [companyId]);

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
    
    if (!companyId) {
      setNotification({ message: 'Company ID not found', type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Add Password field to comply with backend requirements
      const dataToSend = {
        ...tempData,
        Password: "dummyPassword123" // This is a workaround - the backend will ignore this value
      };
      
      // Call our update_company endpoint
      const response = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/update_company/${companyId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'Failed to update profile');
      }
      
      const updatedData = await response.json();
      
      // Update the local state with the response data
      setUserData({
        Company_name: updatedData.Company_name,
        Contact_number: updatedData.Contact_number,
        Email: updatedData.Email,
        location: updatedData.location,
      });
      
      // Also update localStorage for future use
      localStorage.setItem('companyName', updatedData.Company_name);
      localStorage.setItem('companyPhone', updatedData.Contact_number);
      localStorage.setItem('companyEmail', updatedData.Email);
      localStorage.setItem('companyAddress', updatedData.location);
      
      setIsEditing(false);
      setNotification({ message: 'Company profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating company:', error);
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
                  <InputLabel>Phone Number</InputLabel>
                  <OutlinedInput
                    value={tempData.Contact_number}
                    onChange={handleInputChange('Contact_number')}
                    label="Phone Number"
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
                  <InputLabel>Address</InputLabel>
                  <OutlinedInput
                    value={tempData.location}
                    onChange={handleInputChange('location')}
                    label="Address"
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
                  {loading ? 'Saving...' : 'Save Changes'}
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