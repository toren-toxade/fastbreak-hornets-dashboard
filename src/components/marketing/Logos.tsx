const logos = [
  "Big East", "ACC", "NBA", "WNBA", "NCAA", "FIBA"
];

export default function Logos() {
  return (
    <section id="partners" className="bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-gray-500">
          Powering Schedules for the World’s Premier Leagues
        </p>
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((name) => (
            <div key={name} className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-4 text-sm font-semibold text-gray-600 shadow-sm">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}