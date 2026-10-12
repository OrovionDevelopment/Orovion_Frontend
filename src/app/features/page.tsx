import Services from "@/screens/Services";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Explore Clinical Cases, Medical Pulses, Research Summaries and Private Consults — everything you can do on Orovion, in one connected healthcare network.",
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
