export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50">
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute left-1/2 top-[-6rem] h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:py-28">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Ultimate AI-Powered Sports Operations engine
          </h1>
          <p className="mt-5 max-w-xl text-lg text-gray-600">
            Intelligent software for sports league scheduling, tournament management, and experiential sponsorships.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/auth/login"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Get Started
            </a>
            <a
              href="#roles"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Choose Your Role
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-blue-600/10" />
                <p className="text-sm font-medium text-blue-600">Preview</p>
                <p className="mt-1 text-gray-500">Dashboard and scheduling tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}