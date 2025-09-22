"use client";

import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-subtle bg-[rgba(11,18,32,0.7)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(11,18,32,0.55)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <div>
            <span className="block text-base font-bold leading-none text-[var(--foreground)]">FastBreak</span>
            <span className="block text-xs font-medium leading-none text-[var(--brand-300)]">Sports Operations</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <a href="#roles" className="hover:text-[var(--foreground)]">Solutions</a>
          <a href="#why" className="hover:text-[var(--foreground)]">Why Fastbreak</a>
          <a href="#partners" className="hover:text-[var(--foreground)]">Leagues</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#roles" className="hidden md:block btn btn-secondary">
            Learn More
          </a>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
