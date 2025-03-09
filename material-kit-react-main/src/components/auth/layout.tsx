'use client'; // Add this directive at the top

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DynamicLogo } from '@/components/core/logo';
import { paths } from '@/paths';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 3,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'background.paper',
          zIndex: 1, // Ensure header appears above other content
        }}
      >
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
          <DynamicLogo colorDark="light" colorLight="dark" height={40} width={160} />
        </Box>
        <Typography
          component={RouterLink}
          href={paths.home}
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 500,
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Back to Home
        </Typography>
      </Box>

      {/* Main content with split layout */}
      <Grid container component="main" sx={{ flexGrow: 1 }}>
        {/* Left side - Image/branding (hidden on mobile) */}
        {!isMobile && (
          <Grid
            item
            md={6}
            lg={7}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden', // Ensures the effects stay within bounds
            }}
          >
            {/* Gradient overlay for depth */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(25,118,210,0.9) 0%, rgba(66,66,255,0.75) 50%, rgba(0,77,155,0.8) 100%)',
                zIndex: 1,
              }}
            />
            
            {/* Background image with parallax effect */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                left: -20,
                right: -20,
                bottom: -20,
                backgroundImage: 'url(/assets/auth-background.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(2px)',
                transform: 'scale(1.1)',
                zIndex: 0,
              }}
            />
            
            {/* Animated pattern overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(/assets/pattern-dots.png)', // Add a subtle pattern image
                backgroundSize: '30px 30px',
                opacity: 0.1,
                zIndex: 2,
              }}
            />
            
            {/* Content with card-like appearance */}
            <Box
              sx={{
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                p: 5,
                textAlign: 'center',
                color: 'white',
                maxWidth: '80%',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  fontSize: { md: '2.2rem', lg: '2.7rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                Driving Behavior Analysis System
              </Typography>
              <Typography 
                variant="h6"
                sx={{
                  fontWeight: 300,
                  lineHeight: 1.5,
                  mt: 2,
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                }}
              >
                Monitor, analyze and improve driving habits for safer roads
              </Typography>
              
              {/* Feature highlights */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  mt: 4,
                }}
              >
                {[
                  { icon: '🚗', text: 'Driver Behavior Tracking' },
                  { icon: '📊', text: 'Detailed Reports' },
                  { icon: '🛡️', text: 'Safety Insights' }
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h5">{item.icon}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Decorative shapes */}
            {[1, 2, 3, 4].map((item) => (
              <Box
                key={item}
                sx={{
                  position: 'absolute',
                  width: Math.floor(Math.random() * 100) + 50,
                  height: Math.floor(Math.random() * 100) + 50,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                  top: `${Math.floor(Math.random() * 100)}%`,
                  left: `${Math.floor(Math.random() * 100)}%`,
                  zIndex: 2,
                }}
              />
            ))}
          </Grid>
        )}

        {/* Right side - Form */}
        <Grid
          item
          xs={12}
          md={6}
          lg={5}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, sm: 4, md: 6 },
            backgroundColor: 'background.paper',
          }}
        >
          {children}
        </Grid>
      </Grid>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Driving Behavior Analysis System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}