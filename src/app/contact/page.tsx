import Contact from "@/screens/Contact";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Talk to the Orovion team about verification, consultations or partnerships. Send us a message and our team will get back to you within two business days.",
  path: "/contact",
});

export default function Page() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]} />
      <Contact />
    </>
  );
}
