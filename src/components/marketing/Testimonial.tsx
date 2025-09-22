export default function Testimonial() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <figure className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm sm:p-10">
          <blockquote className="text-lg text-gray-700 sm:text-xl">
            “Fastbreak has been a valued partner with the Big East for a number of years. With the most difficult and complex scheduling needs, they consistently deliver.”
          </blockquote>
          <figcaption className="mt-4 text-sm font-medium text-gray-600">— Big East Conference</figcaption>
        </figure>
      </div>
    </section>
  );
}