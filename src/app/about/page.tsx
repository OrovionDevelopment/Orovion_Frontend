import About from "@/screens/About";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "About us",
  description:
    "Who we are and why we built Orovion: a verified network where healthcare professionals, medical students and patients share knowledge and find care they can trust.",
  path: "/about",
});

export default function Page() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]} />
      <About />
    </>
  );
}
