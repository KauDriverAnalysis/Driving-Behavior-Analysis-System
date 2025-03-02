'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Button, 
  FormControl,
  Grid,
  InputLabel,
  OutlinedInput,
  Paper,
  Stack,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
// TODO: Add these icon imports
// import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function AddEmployee(): React.JSX.Element {
  const theme = useTheme();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add logic to save the employee information
    alert('Employee added successfully!');
  };

  return (
    <Box
      sx={{
        maxWidth: '900px',
        width: '100%',
        margin: 'auto',
        padding: { xs: 2, sm: 3 },
        // Removed minHeight to eliminate excessive vertical space
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
          marginTop: '20px', // Add some space from the top, but not too much
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: '#6366F1', // Modern indigo/purple
            color: 'white',
            py: 3, // Reduced vertical padding
            px: { xs: 3, md: 4 },
            position: 'relative',
          }}
        >
          <Typography 
            variant="h5" // Slightly smaller heading
            fontWeight="600"
          >
            Add New Employee
          </Typography>
          <Typography 
            variant="body2" // Smaller subtitle text
            sx={{ 
              mt: 0.5,
              opacity: 0.9,
              maxWidth: '600px'
            }}
          >
            Create a new employee profile by filling in the details below
          </Typography>
          {/* TODO: Uncomment after adding PersonAddIcon import */}
          <Box
            sx={{
              position: 'absolute',
              right: { xs: '2rem', md: '2.5rem' },
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '50%',
              p: 1.5, // Smaller padding
              bgcolor: alpha(theme.palette.common.white, 0.15),
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* <PersonAddIcon sx={{ fontSize: 32 }} /> */}
            {/* Replace this comment with the PersonAddIcon component once imported */}
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}> {/* Reduced padding */}
            <Grid container spacing={2.5}> {/* Reduced spacing */}
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
                <FormControl fullWidth required>
                  <InputLabel>Email address</InputLabel>
                  <OutlinedInput label="Email address" name="email" type="email" />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Phone number</InputLabel>
                  <OutlinedInput label="Phone number" name="phone" />
                </FormControl>
              </Grid>
            </Grid>

            {/* Form Actions */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ 
                mt: 4, // Reduced top margin
                justifyContent: 'space-between',
              }}
            >
              <Link href="/dashboard/employees" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  // TODO: Uncomment after adding ArrowBackIcon import
                  // startIcon={<ArrowBackIcon />}
                  sx={{ px: 3, py: 1 }}
                >
                  Back to Employees
                </Button>
              </Link>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ 
                  px: 3.5, 
                  py: 1,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                }}
              >
                Add Employee
              </Button>
            </Stack>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}