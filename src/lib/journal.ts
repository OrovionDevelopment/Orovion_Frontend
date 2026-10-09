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
  /** Card label and article kicker. */
  tag: "Pulse" | "Case study" | "Research";
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
    tag: "Pulse",
    title: "HEALTHCARE PROFESSIONAL",
    excerpt: "Rate, rhythm, axis — a quick, structured routine for the night shift.",
    lede: "A paediatric ECG can look intimidating at 3 a.m. — small complexes, fast rates and normal values that change with age. A short, repeatable routine turns it from a puzzle into a checklist.",
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
    slug: "what-makes-a-case-discussion-useful",
    tag: "Case study",
    title: "What makes a case discussion useful?",
    excerpt: "The details that turn a post into a better decision.",
    lede: "The best case discussions don’t start with a diagnosis — they start with a clear question. A few habits make the difference between a post that collects reactions and one that changes a plan.",
    image: { src: "/marketing/journal-brain.jpg", alt: "An anatomical model of the human brain" },
    sections: [
      {
        heading: "Lead with the question.",
        paragraphs: [
          "Say what you need in the first line: a differential, the next investigation, an opinion on management. Specialists can answer a specific question in minutes; a vague one tends to get general advice.",
          "Then give just enough context — age, key history, timeline and what has already been tried.",
        ],
      },
      {
        heading: "Show the timeline.",
        paragraphs: [
          "Clinical reasoning depends on sequence: what came first, what changed and how fast. A short, dated timeline is often more useful than a long narrative.",
          "Attach the relevant results and images — de-identified, and shared with consent — and say clearly what is still pending.",
        ],
      },
      {
        heading: "Close the loop.",
        paragraphs: [
          "When the case resolves, come back and share the outcome. Follow-ups turn a single answer into shared learning, for the specialists who replied and for every student reading along.",
          "On Orovion every reply shows its author’s verified credentials, so you always know whose reasoning you are weighing.",
        ],
      },
    ],
  },
  {
    slug: "biomarkers-without-the-jargon",
    tag: "Research",
    title: "Biomarkers, without the jargon",
    excerpt: "Which results change management — and which don’t.",
    lede: "A lab report can list dozens of values. The useful question isn’t “is anything abnormal?” — it’s “will this result change what we do next?”",
    image: { src: "/marketing/journal-lab.jpg", alt: "Blood sample tubes in a laboratory rack" },
    sections: [
      {
        heading: "A marker is only as useful as the decision it informs.",
        paragraphs: [
          "Before ordering a test, it helps to know what you would do with each possible result. If no result would change the plan, the test may add cost and worry without adding care.",
          "That is why the same marker can be essential in one setting and noise in another.",
        ],
      },
      {
        heading: "Specific, or sensitive?",
        paragraphs: [
          "Some markers point to one process — troponin, for example, signals injury to heart muscle. Others, like C-reactive protein, rise with inflammation from many causes and need context to interpret.",
          "Neither kind is better; they answer different questions. Knowing which kind you are reading keeps the interpretation honest.",
        ],
      },
      {
        heading: "Trends beat single values.",
        paragraphs: [
          "One result is a snapshot. Repeated measurements — HbA1c over months for long-term glucose control, for instance — often say more than any single number.",
          "When you share results for discussion on Orovion, include earlier values and their dates. Verified specialists can then read the trend, not just the latest point.",
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

/** Reading time in whole minutes at ~200 words a minute, rounded up (at least 1). */
export function readingMinutes(a: Pick<JournalArticle, "lede" | "sections">): number {
  const text = [a.lede, ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs])].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
