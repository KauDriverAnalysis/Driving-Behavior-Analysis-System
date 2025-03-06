import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';

interface EmergencyContactsTabProps {
  showNotification: (message: string, type?: string) => void;
}

interface Contact {
  id: number;
  name: string;
  phone: string;
}

const EmergencyContactsTab: React.FC<EmergencyContactsTabProps> = ({ showNotification }) => {
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([
    { id: 1, name: 'Mom', phone: '(555) 123-4567' },
    { id: 2, name: 'Dad', phone: '(555) 987-6543' }
  ]);
  const [newContact, setNewContact] = useState<{ name: string; phone: string }>({ name: '', phone: '' });

  // Add emergency contact
  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setEmergencyContacts([
        ...emergencyContacts,
        { id: emergencyContacts.length + 1, ...newContact }
      ]);
      setNewContact({ name: '', phone: '' });
      showNotification('Emergency contact added successfully');
    } else {
      showNotification('Please fill in all fields', 'error');
    }
  };

  // Remove emergency contact
  const handleRemoveContact = (id: number) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    showNotification('Emergency contact removed');
  };

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        minHeight: { xs: 'auto', md: '600px' }
      }}>
        <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>Emergency Contacts</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          These contacts will be notified in case of emergencies or severe driving alerts.
        </Typography>
        
        {/* Add New Contact Form */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Contact Name"
              variant="outlined"
              value={newContact.name}
              onChange={(e) => setNewContact({...newContact, name: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={newContact.phone}
              onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              fullWidth
              variant="contained" 
              color="primary"
              onClick={handleAddContact}
              sx={{ height: '100%' }}
            >
              Add Contact
            </Button>
          </Grid>
        </Grid>
        
        {/* Contacts List */}
        <List>
          {emergencyContacts.map(contact => (
            <React.Fragment key={contact.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveContact(contact.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '50%', color: 'primary.main' }}>
                    <PhoneIcon fontSize="small" />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography fontWeight="medium">{contact.name}</Typography>} 
                  secondary={contact.phone} 
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default EmergencyContactsTab;