/**
 * Journal articles (/journal/[slug]) — the long reads behind the home page's
 * community cards ("Read more"). Framework-free so it stays unit-testable.
 *
 * PLACEHOLDER CONTENT: illustrative editorial copy written to be generally
 * accurate, but not reviewed by a clinician. Replace or have it reviewed
 * before launch (docs/marketing-placeholders.md).
 */

export type JournalSection = { heading: string; paragraphs: string[] };

export type JournalArticle = {
  slug: string;
  title: string;
  /** One line for cards and search snippets. */
  excerpt: string;
  /** Opening paragraph under the title. */
  lede: string;
  image: { src: string; alt: string };
  sections: JournalSection[];
};

export const JOURNAL: JournalArticle[] = [
  {
    slug: "reading-a-paediatric-ecg",
    title: "HealthCare Professional",
    excerpt: "Build your professional presence, connect with peers, share clinical knowledge and access private consultations.",
    lede: "A professional network built around your practice. Orovion gives healthcare professionals a dedicated space to build their professional presence, connect with peers, share knowledge and engage with the wider healthcare community.",
    image: { src: "/marketing/journal-heart.jpg", alt: "An anatomical model of the human heart" },
    sections: [
      {
        heading: "Build your professional presence.",
        paragraphs: [
          "Create a profile that reflects your qualifications, experience, specialties and professional interests. Verified credentials help establish your professional identity across the network."
        ],
      },
      {
        heading: "Connect beyond your workplace.",
        paragraphs: [
          "Discover healthcare professionals and medical students across the network. Build meaningful professional connections, exchange messages and stay connected with people working and learning across healthcare.",
        ],
      },
      {
        heading: "Share what you know.",
        paragraphs: [
          "Publish Posts, Pulses, Case Studies and Research Summaries to share your knowledge, experiences and perspectives with the Orovion community.",
        ],
      },
    ],
  },
  {
    slug: "Medical Student",
    title: "Medical Student",
    excerpt: "Connect with healthcare professionals, explore Case Studies, Pulses and Research Summaries, and share your own academic work.",
    lede: "Learn beyond the classroom. Orovion connects medical students with healthcare professionals, clinical knowledge, case discussions and research in one professional healthcare network.",
    image: { src: "/marketing/journal-brain.jpg", alt: "An anatomical model of the human brain" },
    sections: [
      {
        heading: "Learn from the healthcare community.",
        paragraphs: [
          "Explore Case Studies, Pulses and Research Summaries to discover clinical perspectives and knowledge beyond textbooks and lectures.",
        ],
      },
      {
        heading: "Build connections that matter.",
        paragraphs: [
          "Connect with healthcare professionals and fellow students, follow their work and continue conversations through your professional network.",
        ],
      },
      {
        heading: "Share your own work.",
        paragraphs: [
          "Contribute Research Summaries, Posts and other knowledge to build your presence and participate in meaningful healthcare discussions.",
        ],
      },
    ],
  },
  {
    slug: "biomarkers-without-the-jargon",
    title: "General User",
    excerpt: "Discover healthcare professionals, explore healthcare knowledge and request private consultations when you need them.",
    lede: "A simpler way to navigate healthcare. Orovion helps you discover healthcare professionals, explore healthcare knowledge and connect with the people you need, all within one healthcare network.",
    image: { src: "/marketing/journal-lab.jpg", alt: "Blood sample tubes in a laboratory rack" },
    sections: [
      {
        heading: "Discover the right professionals.",
        paragraphs: [
          "Explore healthcare professional profiles, their expertise and professional information to better understand who you are connecting with.",
        ],
      },
      {
        heading: "Understand healthcare knowledge.",
        paragraphs: [
          "Explore Case Studies, Pulses and Research Summaries to learn more about healthcare topics and perspectives shared across the network.",
        ],
      },
      {
        heading: "Access private consultations.",
        paragraphs: [
          "When you need professional guidance, find a verified healthcare professional, request a private consultation and schedule a suitable time through Orovion.",
        ],
      },
    ],
  },
];

export function findArticle(slug: string): JournalArticle | undefined {
  return JOURNAL.find((a) => a.slug === slug);
}

/** "More insights": up to two other articles, starting with the next one. */
export function relatedArticles(slug: string): JournalArticle[] {
  const i = JOURNAL.findIndex((a) => a.slug === slug);
  const rest = [...JOURNAL.slice(i + 1), ...JOURNAL.slice(0, Math.max(0, i))].filter((a) => a.slug !== slug);
  return rest.slice(0, 2);
}
