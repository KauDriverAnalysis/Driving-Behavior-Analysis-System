'use client';

import * as React from 'react';
import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Buildings as CompanyIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { User as CustomerIcon } from '@phosphor-icons/react/dist/ssr/User';

import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { CustomerSignUpForm } from '@/components/auth/customer-signUp-form';
import { CompanySignUpForm } from '@/components/auth/company-signUp-form';

export default function Page(): React.JSX.Element {
  const [accountType, setAccountType] = useState<'customer' | 'company'>('customer');

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
          
          {accountType === 'customer' ? <CustomerSignUpForm /> : <CompanySignUpForm />}
        </Box>
      </GuestGuard>
    </Layout>
  );
}