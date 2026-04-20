import {
  DeepDives,
  Faq,
  FeatureGrid,
  FinalCta,
  Footer,
  Hero,
  Navbar,
  Outcomes,
  Testimonials,
  TraderTypes,
  TrustBar,
  Workflow,
} from "@/components/landing";

export default function MarketingHomePage() {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-[oklch(0.07_0.03_265)]">
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[oklch(0.07_0.03_265)]" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-hero-spotlight opacity-90" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-vignette" />
      <div className="pointer-events-none fixed inset-0 -z-[5] bg-grid opacity-[0.28]" />
      <div className="pointer-events-none fixed inset-0 -z-[4] bg-noise opacity-[0.25]" />
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Outcomes />
        <FeatureGrid />
        <DeepDives />
        <Workflow />
        <TraderTypes />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
