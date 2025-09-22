"use client";

import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <div>
            <span className="block text-base font-bold text-gray-900 leading-none">FastBreak</span>
            <span className="block text-xs font-medium text-blue-600 leading-none">Sports Operations</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <a href="#roles" className="hover:text-gray-900">Solutions</a>
          <a href="#why" className="hover:text-gray-900">Why Fastbreak</a>
          <a href="#partners" className="hover:text-gray-900">Leagues</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#roles" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 md:block">
            Learn More
          </a>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}