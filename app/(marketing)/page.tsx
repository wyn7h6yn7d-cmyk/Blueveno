import {
  DeepDives,
  Faq,
  FeatureGrid,
  FinalCta,
  Footer,
  Hero,
  MarketingBackground,
  Navbar,
  Outcomes,
  ProductArchitectureStrip,
  SectionDivider,
  Testimonials,
  TraderTypes,
  TrustBar,
  Workflow,
} from "@/components/landing";

export default function MarketingHomePage() {
  return (
    <MarketingBackground>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <ProductArchitectureStrip />
        <SectionDivider />
        <Outcomes />
        <SectionDivider />
        <FeatureGrid />
        <DeepDives />
        <SectionDivider />
        <Workflow />
        <TraderTypes />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </MarketingBackground>
  );
}
