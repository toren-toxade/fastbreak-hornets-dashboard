'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { LogOut, User } from 'lucide-react';

export default function LogoutButton() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="animate-pulse w-32 h-10 bg-gray-200 rounded"></div>;
  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
<div className="flex items-center gap-2 text-sm text-muted">
        <User size={16} />
        <span className="font-medium">{user.name || user.email}</span>
      </div>
      <a
        href="/auth/logout"
        aria-label="Sign out of FastBreak"
className="btn btn-secondary"
      >
        <LogOut size={16} />
        Sign Out
      </a>
    </div>
  );
}