import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;    // This is missing in your implementation
  icon: React.ReactNode;
  iconColor: string;   // You're using 'color' instead of this
  iconBgColor: string; // This is missing in your implementation
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor, 
  iconBgColor 
}) => {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      height: '100%'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="text.secondary" fontWeight="medium">{title}</Typography>
        <Box sx={{ p: 1, bgcolor: iconBgColor, borderRadius: '50%', color: iconColor }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
    </Paper>
  );
};

export default StatCard;