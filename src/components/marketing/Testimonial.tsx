export default function Testimonial() {
  return (
    <section className="bg-transparent py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <figure className="rounded-2xl border border-subtle bg-[var(--surface)] p-8 shadow-card sm:p-10">
          <blockquote className="text-lg sm:text-xl text-[var(--foreground)]">
            “Fastbreak has been a valued partner with the Big East for a number of years. With the most difficult and complex scheduling needs, they consistently deliver.”
          </blockquote>
          <figcaption className="mt-4 text-sm font-medium text-muted">— Big East Conference</figcaption>
        </figure>
      </div>
    </section>
  );
}
