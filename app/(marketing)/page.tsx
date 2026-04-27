import type { Metadata } from "next";
import { BluevenoHomePage } from "@/components/marketing/blueveno-home";
import { PRODUCT_DESCRIPTION, PRODUCT_TAGLINE } from "@/lib/product";

export const metadata: Metadata = {
  title: `Blueveno — ${PRODUCT_TAGLINE}`,
  description: PRODUCT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: `Blueveno — ${PRODUCT_TAGLINE}`,
    description: PRODUCT_DESCRIPTION,
  },
};

export default function MarketingHomePage() {
  return <BluevenoHomePage />;
}
