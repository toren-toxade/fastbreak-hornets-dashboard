import MarketingNav from "@/components/marketing/MarketingNav";
import Hero from "@/components/marketing/Hero";
import Roles from "@/components/marketing/Roles";
import Logos from "@/components/marketing/Logos";
import Features from "@/components/marketing/Features";
import Testimonial from "@/components/marketing/Testimonial";
import Footer from "@/components/marketing/Footer";

export default function UnauthenticatedPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingNav />
      <Hero />
      <Roles />
      <Logos />
      <Features />
      <Testimonial />
      <div className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Sign In to Continue
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
