import { AmbientField } from "./ambient-field";
import { CalendarSection } from "./calendar-section";
import { FinalCta } from "./final-cta";
import { HeroSection } from "./hero-section";
import { HomeFooter } from "./home-footer";
import { HomeNavigation } from "./home-navigation";
import { JournalDaySection } from "./journal-day-section";
import { ValueStrip } from "./value-strip";

export function BluevenoHomePage() {
  return (
    <div className="relative min-h-screen text-zinc-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-zinc-100 focus:px-3 focus:py-2 focus:text-sm focus:text-zinc-900"
      >
        Skip to content
      </a>
      <AmbientField />
      <HomeNavigation />
      <main id="main-content">
        <HeroSection />
        <ValueStrip />
        <CalendarSection />
        <JournalDaySection />
        <FinalCta />
      </main>
      <HomeFooter />
    </div>
  );
}
