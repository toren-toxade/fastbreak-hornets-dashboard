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
    <section id="why" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Optimizing Sports Operations
          </h2>
          <p className="mt-3 text-gray-600">
            Fastbreak AI products optimize every part of sports—from scheduling and event management to travel, ticketing, and brand activations.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600 ring-1 ring-inset ring-blue-100">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}