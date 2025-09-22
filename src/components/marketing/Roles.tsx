import { Megaphone, Shield, Trophy } from "lucide-react";

const items = [
  {
    title: "Pro Sports",
    desc: "Advanced AI schedule creation and optimization for leagues and teams.",
    icon: Trophy,
  },
  {
    title: "Brands & Agencies",
    desc: "Connect with youth athletes and families through scalable on-site activations and sponsorships.",
    icon: Megaphone,
  },
  {
    title: "Amateur & Youth Sports",
    desc: "Powerful registration, scheduling, and event management for leagues & tournaments.",
    icon: Shield,
  },
];

export default function Roles() {
  return (
    <section id="roles" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Choose Your Role</h2>
          <p className="mt-3 text-gray-600">
            AI-driven solutions to power your game.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600 ring-1 ring-inset ring-blue-100">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              </div>
              <div className="mt-6">
                <a href="/auth/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Explore →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}