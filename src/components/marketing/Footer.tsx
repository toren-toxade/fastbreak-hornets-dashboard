export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} FastBreak. All rights reserved.</p>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <a href="#roles" className="hover:text-gray-900">Solutions</a>
          <a href="#why" className="hover:text-gray-900">Why Fastbreak</a>
          <a href="/auth/login" className="hover:text-gray-900">Sign In</a>
        </nav>
      </div>
    </footer>
  );
}