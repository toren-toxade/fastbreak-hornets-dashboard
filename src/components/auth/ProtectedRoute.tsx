'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { ReactNode } from 'react';
import LoginButton from './LoginButton';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏀 FastBreak
            </h1>
            <p className="text-xl text-blue-600 font-semibold mb-4">
              Charlotte Hornets Dashboard
            </p>
            <p className="text-gray-600">
              Access player statistics, performance insights, and team analytics.
              Please sign in to continue.
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}