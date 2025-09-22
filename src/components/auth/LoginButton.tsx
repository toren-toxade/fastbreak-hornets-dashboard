'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="animate-pulse w-24 h-10 bg-gray-200 rounded"></div>;
  if (user) return null;

  return (
    <a
      href="/auth/login"
      aria-label="Sign in to FastBreak"
className="btn btn-primary"
    >
      <LogIn size={20} />
      Sign In
    </a>
  );
}