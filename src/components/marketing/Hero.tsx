export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute left-1/2 top-[-6rem] h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:py-28">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-pretty text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Ultimate AI-Powered Sports Operations engine
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Intelligent software for sports league scheduling, tournament management, and experiential sponsorships.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/auth/login"
              className="btn btn-primary"
            >
              Get Started
            </a>
            <a
              href="#roles"
              className="btn btn-secondary"
            >
              Choose Your Role
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-subtle bg-[var(--surface)] shadow-card">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-[rgba(37,99,235,0.12)]" />
                <p className="text-sm font-medium text-[var(--brand-300)]">Preview</p>
                <p className="mt-1 text-muted">Dashboard and scheduling tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
