'use client';

import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏀</div>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">FastBreak</h1>
            <p className="text-sm text-[var(--brand-600)] font-medium">Charlotte Hornets Dashboard</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}