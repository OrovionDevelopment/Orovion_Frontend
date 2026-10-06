import Journal from "@/screens/Journal";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Journal",
  description:
    "Cases, practical explainers and research from verified clinicians on Orovion — clear ideas to help you learn, decide and care with confidence.",
  path: "/journal",
});

export default function Page() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }])]} />
      <Journal />
    </>
  );
}
