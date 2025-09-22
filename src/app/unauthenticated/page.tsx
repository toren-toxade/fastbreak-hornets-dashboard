import MarketingNav from "@/components/marketing/MarketingNav";
import Hero from "@/components/marketing/Hero";
import Roles from "@/components/marketing/Roles";
import Logos from "@/components/marketing/Logos";
import Features from "@/components/marketing/Features";
import Testimonial from "@/components/marketing/Testimonial";
import Footer from "@/components/marketing/Footer";

export default function UnauthenticatedPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <MarketingNav />
      <Hero />
      <Roles />
      <Logos />
      <Features />
      <Testimonial />
      <div className="bg-transparent py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <a
            href="/auth/login"
            className="btn btn-primary"
          >
            Sign In to Continue
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
