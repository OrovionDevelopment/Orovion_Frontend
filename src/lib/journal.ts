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
  /** ISO date (YYYY-MM-DD). */
  date: string;
  image: { src: string; alt: string };
  sections: JournalSection[];
  /** Pull quote, set after the first section. */
  quote: string;
  author: string;
};

export const JOURNAL: JournalArticle[] = [
  {
    slug: "reading-a-paediatric-ecg",
    tag: "Pulse",
    title: "Reading a paediatric ECG in 60 seconds",
    excerpt: "Rate, rhythm, axis — a quick, structured routine for the night shift.",
    lede: "A paediatric ECG can look intimidating at 3 a.m. — small complexes, fast rates and normal values that change with age. A short, repeatable routine turns it from a puzzle into a checklist.",
    date: "2026-09-18",
    image: { src: "/marketing/journal-heart.jpg", alt: "An anatomical model of the human heart" },
    sections: [
      {
        heading: "Start with the patient, not the paper.",
        paragraphs: [
          "Before reading a single wave, note the child’s age, how they look and why the ECG was taken. Normal heart rates, axis and wave patterns change considerably from newborn to teenager, so the same tracing can be normal at one age and abnormal at another.",
          "Keep an age-specific reference chart within reach. Reading against the right ranges prevents most false alarms — and most missed findings.",
        ],
      },
      {
        heading: "Rate, rhythm, axis — in that order.",
        paragraphs: [
          "Rate first: children’s hearts run faster than adults’, so judge the number against the age band, not the adult range. Then rhythm: look for a P wave before every QRS complex and a steady relationship between them.",
          "Axis comes third. A right-leaning axis is expected in newborns and shifts gradually leftward through childhood — another reason the age on the request matters so much.",
        ],
      },
      {
        heading: "Know when to ask for a second look.",
        paragraphs: [
          "If the tracing doesn’t fit the clinical picture, or something sits outside the age range, ask early. On Orovion you can share a de-identified tracing with verified paediatric cardiologists and get a structured opinion — with their credentials beside every reply.",
          "Speed matters at night. So does knowing when to slow down and check.",
        ],
      },
    ],
    quote: "A routine you trust at 3 a.m. is worth more than a rare finding you remember from a textbook.",
    author: "The Orovion editorial team",
  },
  {
    slug: "what-makes-a-case-discussion-useful",
    tag: "Case study",
    title: "What makes a case discussion useful?",
    excerpt: "The details that turn a post into a better decision.",
    lede: "The best case discussions don’t start with a diagnosis — they start with a clear question. A few habits make the difference between a post that collects reactions and one that changes a plan.",
    date: "2026-09-04",
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
    quote: "A clear question and an honest timeline are the two most useful things you can give a colleague.",
    author: "The Orovion editorial team",
  },
  {
    slug: "biomarkers-without-the-jargon",
    tag: "Research",
    title: "Biomarkers, without the jargon",
    excerpt: "Which results change management — and which don’t.",
    lede: "A lab report can list dozens of values. The useful question isn’t “is anything abnormal?” — it’s “will this result change what we do next?”",
    date: "2026-08-21",
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
    quote: "The right test answers a question you have already asked.",
    author: "The Orovion editorial team",
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
export function readingMinutes(a: Pick<JournalArticle, "lede" | "sections" | "quote">): number {
  const text = [a.lede, a.quote, ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs])].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-09-18" → "18 September 2026" (no Intl, so server and browser always agree). */
export function formatArticleDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
