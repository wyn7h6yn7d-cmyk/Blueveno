import {
  Faq,
  FinalCta,
  Footer,
  Hero,
  MarketingBackground,
  Navbar,
  Outcomes,
  ProductArchitectureStrip,
  ProductShowcase,
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
        <ProductShowcase />
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
