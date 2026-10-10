import HelpCenter from "@/screens/legal/HelpCenter";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { ALL_FAQ_ITEMS } from "@/lib/faq";

export const metadata = pageMetadata({
  title: "Help center",
  description:
    "Answers about getting started on Orovion, connections, sharing, consultations, verification, safety, your profile and account recovery.",
  path: "/help",
});

export default function Page() {
  return (
    <>
      {/* Built from the same `src/lib/faq.ts` the accordion renders, so the
          markup always matches the visible copy — Google's hard requirement
          for the FAQ rich result. */}
      <JsonLd data={[faqPageSchema(ALL_FAQ_ITEMS), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Help", path: "/help" }])]} />
      <HelpCenter />
    </>
  );
}
