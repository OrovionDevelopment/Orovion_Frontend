import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/features/analytics";

// Operator-only analytics: never indexed, never linked from the product UI.
export const metadata: Metadata = {
  title: "Analytics — Orovion admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <AnalyticsDashboard />;
}
