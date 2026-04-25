import { AmbientField } from "./ambient-field";
import { CalendarSection } from "./calendar-section";
import { FinalCta } from "./final-cta";
import { HeroPremium } from "./hero-premium";
import { HomeFooter } from "./home-footer";
import { HomeNavigation } from "./home-navigation";
import { HomePricingSection } from "./home-pricing-section";
import { JournalDaySection } from "./journal-day-section";
import { ValueStrip } from "./value-strip";

export function BluevenoHomePage() {
  return (
    <div className="relative min-h-screen text-zinc-100 antialiased [text-rendering:optimizeLegibility]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-0 z-[1] hidden w-px bg-gradient-to-b from-transparent via-[oklch(0.58_0.13_248/0.34)] to-transparent lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 right-0 z-[1] hidden w-px bg-gradient-to-b from-transparent via-[oklch(0.58_0.13_248/0.3)] to-transparent lg:block"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-zinc-100 focus:px-3 focus:py-2 focus:text-sm focus:text-zinc-900"
      >
        Skip to content
      </a>
      <AmbientField />
      <HomeNavigation />
      <main id="main-content">
        <HeroPremium />
        <ValueStrip />
        <CalendarSection />
        <JournalDaySection />
        <HomePricingSection />
        <FinalCta />
      </main>
      <HomeFooter />
    </div>
  );
}
