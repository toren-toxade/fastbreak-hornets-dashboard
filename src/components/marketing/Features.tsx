import { Brain, DollarSign, MapPin, Sparkles, Wrench } from "lucide-react";

const features = [
  {
    title: "Smarter Scheduling",
    desc: "AI-driven optimization for fairness and efficiency.",
    icon: Brain,
  },
  {
    title: "Less Travel, More Play",
    desc: "Reduce unnecessary travel to cut costs and fatigue.",
    icon: MapPin,
  },
  {
    title: "Maximize Revenue",
    desc: "Integrate sponsors to fund more events and programs.",
    icon: DollarSign,
  },
  {
    title: "Seamless Operations",
    desc: "Streamline logistics and simplify management.",
    icon: Wrench,
  },
  {
    title: "Cutting-Edge AI",
    desc: "Purpose-built tools that help organizations run faster and smarter.",
    icon: Sparkles,
  },
];

export default function Features() {
  return (
    <section id="why" className="bg-transparent py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="typ-h2">
            Optimizing Sports Operations
          </h2>
          <p className="mt-3 text-muted">
            Fastbreak AI products optimize every part of sports—from scheduling and event management to travel, ticketing, and brand activations.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-subtle bg-[var(--surface)] p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="rounded-lg p-3 text-[var(--brand-300)] ring-1 ring-inset ring-[rgba(59,130,246,0.2)] bg-[rgba(37,99,235,0.12)]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
