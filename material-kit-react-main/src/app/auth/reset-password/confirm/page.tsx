"use client";

import React, { Suspense } from 'react';
import PasswordReset from '@/components/auth/password-reset';

// Add a loading component
function LoadingPasswordReset() {
  return <div>Loading password reset...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingPasswordReset />}>
      <PasswordReset />
    </Suspense>
  );
}