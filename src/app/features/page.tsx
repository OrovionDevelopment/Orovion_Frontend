import Services from "@/screens/Services";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Clinical cases, Medical Pulses, research and private consultations with license-verified doctors — everything Orovion offers, and the plans that fit your needs.",
  path: "/features",
});

export default function Page() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Features", path: "/features" }])]} />
      <Services />
    </>
  );
}
