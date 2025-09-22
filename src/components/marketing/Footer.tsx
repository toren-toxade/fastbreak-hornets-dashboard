export default function Footer() {
  return (
    <footer className="border-t border-subtle bg-transparent py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <p className="text-sm text-muted">© {new Date().getFullYear()} FastBreak. All rights reserved.</p>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <a href="#roles" className="hover:text-[var(--foreground)]">Solutions</a>
          <a href="#why" className="hover:text-[var(--foreground)]">Why Fastbreak</a>
          <a href="/auth/login" className="hover:text-[var(--foreground)]">Sign In</a>
        </nav>
      </div>
    </footer>
  );
}
