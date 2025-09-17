'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="animate-pulse w-24 h-10 bg-gray-200 rounded"></div>;
  if (user) return null;

  return (
    <a
      href="/api/auth/login"
      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
    >
      <LogIn size={20} />
      Sign In
    </a>
  );
}