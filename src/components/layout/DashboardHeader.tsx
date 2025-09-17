'use client';

import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏀</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FastBreak</h1>
            <p className="text-sm text-blue-600 font-medium">Charlotte Hornets Dashboard</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}