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
    <div className="relative min-h-full overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-background" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.35]" />
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
