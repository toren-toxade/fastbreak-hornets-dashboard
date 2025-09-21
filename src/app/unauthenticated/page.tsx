export default function UnauthenticatedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FastBreak</h1>
        <p className="text-blue-600 font-medium mb-6">Charlotte Hornets Dashboard</p>
        <p className="text-gray-600 mb-6">
          Sign in to view player statistics, performance insights, and team analytics.
        </p>
        <a
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          Sign In
        </a>
      </div>
    </main>
  );
}
