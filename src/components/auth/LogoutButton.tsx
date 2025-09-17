'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { LogOut, User } from 'lucide-react';

export default function LogoutButton() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="animate-pulse w-32 h-10 bg-gray-200 rounded"></div>;
  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <User size={16} />
        <span className="font-medium">{user.name || user.email}</span>
      </div>
      <a
        href="/api/auth/logout"
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
      >
        <LogOut size={16} />
        Sign Out
      </a>
    </div>
  );
}