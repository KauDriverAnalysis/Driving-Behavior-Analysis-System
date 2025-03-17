'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Buildings as CompanyIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { User as CustomerIcon } from '@phosphor-icons/react/dist/ssr/User';

import { CustomerSignInForm } from '@/components/auth/customer-signIn-form';
import { CompanySignInForm } from '@/components/auth/company-signIn-form';
import { Layout } from '@/components/auth/layout';
import { GuestGuard } from '@/components/auth/guest-guard';

export default function Page(): React.JSX.Element {
  const [accountType, setAccountType] = React.useState<'customer' | 'company'>('customer');

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'customer' | 'company') => {
    setAccountType(newValue);
  };

  return (
    <Layout>
      <GuestGuard>
        <Box sx={{ width: '100%', maxWidth: '450px' }}>
          <Tabs
            value={accountType}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab 
              value="customer" 
              label="Customer" 
              icon={<CustomerIcon size={20} />} 
              iconPosition="start"
            />
            <Tab 
              value="company" 
              label="Company" 
              icon={<CompanyIcon size={20} />} 
              iconPosition="start"
            />
          </Tabs>
          
          {accountType === 'customer' ? 
            <CustomerSignInForm /> : 
            <CompanySignInForm />
          }
        </Box>
      </GuestGuard>
    </Layout>
  );
}