/**
 * Copy and imagery for the public marketing pages (/, /contact, /team,
 * /mobile-app, /help, /privacy, /terms).
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ PLACEHOLDER CONTENT. Everything marked `placeholder: true` (numbers, │
 * │ quotes, people, ratings) and every photo in /public/marketing is     │
 * │ illustrative — replace it with real data before launch. Photos are   │
 * │ free Unsplash images; see docs/marketing-placeholders.md.            │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Framework-free (icons are referenced by key, mapped to components in the
 * screens) so this stays importable from unit tests.
 */
import { FAQ_SECTIONS, type FaqItem } from "./faq";
import { JOURNAL } from "./journal";

export type NavLinkItem = { label: string; href: string };

/** Primary nav (desktop bar + mobile menu). Section anchors are absolute so they work from every page. */
export const NAV_LINKS: NavLinkItem[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Team", href: "/team" },
  { label: "Get the app", href: "/mobile-app" },
  { label: "Help", href: "/help" },
  { label: "Contact", href: "/contact" },
];

/** Footer sitemap, two columns. */
export const SITEMAP: NavLinkItem[][] = [
  [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Journal", href: "/journal" },
    { label: "Stories", href: "/#stories" },
    { label: "How consults work", href: "/#how-it-works" },
    { label: "Meet the team", href: "/team" },
  ],
  [
    { label: "Get the app", href: "/mobile-app" },
    { label: "Help center", href: "/help" },
    { label: "Contact us", href: "/contact" },
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms & conditions", href: "/terms" },
  ],
];

/** Real Orovion social profiles. */
export const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/orovion/" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/orovion.app" },
  { key: "x", label: "X (Twitter)", href: "https://x.com/orovion?s=20" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/people/Orovion/61591959148775/" },
  { key: "reddit", label: "Reddit", href: "https://www.reddit.com/user/orovion/" },
] as const;

/* ── Social proof ─────────────────────────────────────────────────────── */

/** Face photos used in avatar stacks. placeholder: true */
export const TRUST_AVATARS = [
  { src: "/marketing/avatar-1.jpg", alt: "" },
  { src: "/marketing/avatar-2.jpg", alt: "" },
  { src: "/marketing/avatar-3.jpg", alt: "" },
  { src: "/marketing/avatar-4.jpg", alt: "" },
  { src: "/marketing/avatar-5.jpg", alt: "" },
];

export const TRUST = {
  placeholder: true,
  label: "Trusted by 12,000+ healthcare professionals",
  badge: "+12k",
  rating: "4.9",
  ratingLabel: "out of 5 from verified members",
};

export const STATS = [
  { value: 12000, suffix: "+", label: "Verified clinicians", placeholder: true },
  { value: 40, suffix: "+", label: "Medical specialties", placeholder: true },
  { value: 180, suffix: "k", label: "Case discussions", placeholder: true },
  { value: 24, suffix: "/7", label: "Consults across time zones", placeholder: true },
];

/* ── Home page (/) ────────────────────────────────────────────────────
   Section order mirrors the reference home page: hero → trust toggle →
   services → philosophy → story → how it works → ready → text + big quote →
   story → community → numbers → FAQ → contact. Everything marked
   `placeholder: true` is illustrative copy to replace. */

export const STEPS = [
  { title: "Find a verified specialist", text: "Search by name, specialty or condition. Every clinician carries a license-verified badge before they can consult — no guesswork about who you are talking to." },
  { title: "Request a consultation", text: "Pick a slot from the doctor's live availability, share what is going on and attach your reports. Payment confirms the booking." },
  { title: "Meet on secure video", text: "Join the call inside Orovion. Prescriptions and summaries stay in your consultation history — only you and your doctor can open them." },
];

/**
 * The four services: a card on the home page (`title`, `text`, `image`) whose
 * "Read more" opens its full section on /services (`#slug`: `body`, `photo`,
 * `cta`). Copy is product description — adjust to taste.
 */
export const SERVICES = [
  {
    slug: "clinical-cases",
    title: "Clinical Cases",
    text: "De-identified cases discussed by verified specialists — real perspectives you can trust.",
    image: "/marketing/service-cases.jpg",
    photo: "/marketing/svc-cases.jpg",
    body: [
      "Real cases are where medicine is learned. On Orovion, clinicians share de-identified cases — with consent and without identifying details — and verified specialists weigh in with their reasoning, references and follow-ups.",
      "Every reply carries its author’s verified credentials, so you always know whose perspective you are reading. Ideal for doctors looking for a second opinion and students learning how experts think.",
    ],
    cta: { label: "Explore cases", to: "/app/explore" },
  },
  {
    slug: "medical-pulses",
    title: "Medical Pulses",
    text: "Short clinical explainers and procedures, made by the people who perform them.",
    image: "/marketing/service-pulses.jpg",
    photo: "/marketing/svc-pulses.jpg",
    body: [
      "Pulses are short clinical explainers — procedures, signs and techniques — made by the people who perform them every day. Watch them between rounds, save the ones you need and come back before your next shift.",
      "Each Pulse is tagged by specialty and credited to a verified author, so the feed stays practical, accurate and easy to search.",
    ],
    cta: { label: "Watch Pulses", to: "/app/pulse" },
  },
  {
    slug: "research-thesis",
    title: "Research & Thesis",
    text: "Papers, theses and new findings, shared and discussed with their authors.",
    image: "/marketing/service-research.jpg",
    photo: "/marketing/svc-research.jpg",
    body: [
      "Share your papers, theses and new findings, and discuss them with peers who understand the work. Authors stay visible, and every discussion links back to the original.",
      "From early questions to published results, research on Orovion reaches the clinicians and students it can help most — and the feedback that makes it stronger.",
    ],
    cta: { label: "Browse research", to: "/app/explore" },
  },
  {
    slug: "private-consults",
    title: "Private Consults",
    text: "Secure video consultations with license-verified doctors, booked in minutes.",
    image: "/marketing/service-consults.jpg",
    photo: "/marketing/svc-consults.jpg",
    body: [
      "Book secure video consultations with license-verified doctors. Pick a slot from their live availability, share your reports and meet inside Orovion — no third-party apps.",
      "Prescriptions and summaries stay in your consultation history, visible only to you and your doctor, so follow-ups are simple.",
    ],
    cta: { label: "Book a consult", to: "/app/consults" },
  },
];

export const HOME = {
  hero: {
    title: "Where Healthcare Comes Together.",
    text: "Orovion brings verified healthcare professionals, medical students and people into one trusted network — to share knowledge, discuss real cases and book private consultations, at your own pace.",
    cta: { label: "Join Orovion", to: "/login" },
    image: { src: "/marketing/hero-portrait.jpg", srcPhone: "/marketing/hero-portrait-tall.jpg", alt: "Doctor with a stethoscope, smiling in soft light" },
    placeholder: true,
  },
  /** The scroll-driven toggle that follows the hero. */
  trust: {
    label: "Verified",
    before: {
      title: "If only finding care you can trust were as simple as flipping a switch.",
      lines: ["It’s closer than you think.", "And every verified profile makes it clearer."],
    },
    after: {
      title: "There may not be a single switch,",
      accent: "but there is a verified network.",
      text: "Every clinician on Orovion passes license verification. These are the ways we help people learn, connect and get care with confidence.",
    },
  },
  /** Service cards — "Read more" opens the service's section on /services. */
  services: SERVICES.map((s) => ({ title: s.title, text: s.text, image: s.image, href: `/services#${s.slug}` })),
  philosophy: {
    eyebrow: "Our philosophy",
    text: "At Orovion, we don’t ask you to take trust on faith — we verify it. Through licensed professionals, transparent authorship and real conversations, we help medical knowledge move safely between the people who need it.",
    cta: { label: "Meet the team", to: "/about" },
  },
  stories: [
    {
      placeholder: true,
      eyebrow: "Real clinicians. Real cases.",
      title: "A second opinion before morning rounds.",
      text: "Dr. Ananya Mehra posted a puzzling case at 2 a.m. By sunrise, three interventional cardiologists in other cities had weighed in — and her patient’s plan was clearer for it.",
      cta: { label: "Read the story", to: "/login" },
      images: [
        { src: "/marketing/story-a-main.jpg", alt: "Two doctors reviewing a brain scan on a monitor" },
        { src: "/marketing/story-a-detail.jpg", alt: "Doctor in a white coat, arms crossed" },
      ],
    },
    {
      placeholder: true,
      eyebrow: "Care, closer to home.",
      title: "A follow-up without the three-hour drive.",
      text: "When Meera’s father needed a cardiology review, a verified specialist read his reports and met them on video the same week. The prescription was waiting before the call ended.",
      cta: { label: "Read the story", to: "/login" },
      images: [
        { src: "/marketing/story-b-main.jpg", alt: "A caregiver holding an older patient’s hand" },
        { src: "/marketing/story-b-detail.jpg", alt: "Nurse checking a patient’s blood pressure" },
      ],
    },
  ],
  how: {
    title: { lead: "How", accent: "It Works" },
    text: "Getting care doesn’t have to be complicated. Our process is simple, verified at every step, and designed around your time — from the first search to the follow-up.",
    steps: STEPS,
  },
  ready: {
    title: "Ready to join",
    accent: "the network?",
    text: "Whether you practise, study or are looking for guidance, Orovion meets you where you are. Create your profile in minutes — verification takes a couple of days.",
    cta: { label: "Join Orovion", to: "/login" },
  },
  statement: {
    title: "Knowledge grounded in evidence, shared by verified people, and",
    accent: "built for better care.",
    text: "Every post on Orovion shows who wrote it, what they are licensed for and where they practise. Learn more about",
    link: { label: "how verification works", to: "/help#verification" },
    tail: "and what to expect.",
  },
  quote: {
    placeholder: true,
    text: "Medicine moves forward when knowledge moves freely — between people you can trust.",
    author: "Dr. Arjun Malhotra · Consultant Pediatrician",
    image: { src: "/marketing/quote-theatre.jpg", alt: "Surgeons working under operating-theatre lights" },
  },
  /** "Get the app" band above the FAQ: a thread draws a phone; desktop shows a QR inside, touch screens a button. */
  app: {
    eyebrow: "Get the app",
    title: "Your verified network,",
    accent: "in your pocket.",
    text: "Follow cases, catch a Pulse between rounds and book a consult from anywhere — the same verified Orovion, made for one hand.",
    facts: ["Free to join", "iOS & Android", "Verified clinicians only"],
    to: "/mobile-app",
    scan: { title: "Scan to get Orovion", hint: "Point your phone’s camera at the code" },
    tap: { text: "Learn, share and get care on the go.", cta: "Get the app" },
  },
  community: {
    eyebrow: "From the community",
    title: "Insights for sharper thinking and better care.",
    text: "Cases, explainers and research from verified clinicians — one clear idea at a time.",
    cta: { label: "Explore the feed", to: "/journal" },
    /** Journal cards — "Read more" opens the article (src/lib/journal.ts). */
    posts: JOURNAL.map((a) => ({ tag: a.tag, title: a.title, text: a.excerpt, image: a.image.src, href: `/journal/${a.slug}` })),
  },
  numbers: {
    title: "From the first case to lasting change,",
    accent: "these numbers reflect a network built on trust.",
    text: "Every count below is a verified person, a real discussion or a consultation that happened on Orovion.",
  },
};

/* ── About page (/about) ──────────────────────────────────────────────
   Section order mirrors the reference about page: hero (long threads) → the
   way we help (scroll-lit text over a photo) → founders (story) → team
   cards → statement → ready → big quote → story → FAQ.
   The founders and team cards read from src/lib/team.ts. Everything marked
   `placeholder: true` is illustrative copy to replace. */

export const ABOUT = {
  hero: {
    lead: "Your Health,",
    title: "Our Purpose.",
    side: "Find out who we are, what we stand for, and how we bring trusted care closer to everyone.",
    eyebrow: "About",
    intro: "At Orovion, we believe every question about health deserves an answer you can trust. Our role is to bring verified clinicians, medical students and patients together — with clarity, accountability and care.",
  },
  help: {
    eyebrow: "The way we help",
    image: { src: "/marketing/about-help.jpg", alt: "" },
    text: "We start by verifying — really verifying — every clinician who joins. From there, we build a space that is honest, useful and safe: cases shared with consent, knowledge shared with authorship, and consultations booked with confidence.",
  },
  founders: {
    placeholder: true,
    title: { lead: "Meet Our", accent: "Founders" },
    lead: { before: "Orovion was started by ", strong: "Pawan Gupta, Adarsh Singh and Ayush Sachan, engineers from MMMUT Gorakhpur", after: " who believed finding trusted medical knowledge and care should be far simpler than it is." },
    text: "They built Orovion to be a calm, verified space where healthcare professionals can share what they know, and where anyone can find guidance with confidence.",
  },
  team: {
    eyebrow: "Our team",
    title: "The People Building Orovion.",
    text: "Orovion is more than a platform — each member of our team works to make trusted healthcare easier to find, understand and act on.",
  },
  statement: {
    placeholder: true,
    title: "Care grounded in evidence, guided by verification, and",
    accent: "built for lasting trust.",
    text: "Our platform creates room for that trust to grow. We check credentials, keep authorship visible and protect every conversation. Learn more about",
    link: { label: "how verification works", to: "/help#verification" },
    tail: "and what to expect from us.",
  },
  quote: {
    placeholder: true,
    text: "Every verified answer makes the next decision a little easier — for the doctor and for the patient.",
    author: "The Orovion team",
    image: { src: "/marketing/about-quote.jpg", alt: "Dark clouds lit by warm light" },
  },
  story: {
    placeholder: true,
    eyebrow: "Real people. Real care.",
    title: "Care that found its way home.",
    text: "When Ravi’s mother moved back to their village, her cardiologist was a six-hour journey away. On Orovion, a verified specialist reviewed her reports, met them on video and stayed in touch — and Ravi finally stopped worrying between visits.",
    cta: { label: "Start your journey", to: "/login" },
    images: [
      { src: "/marketing/about-story-main.jpg", alt: "A doctor talking with a patient in a clinic" },
      { src: "/marketing/about-story-detail.jpg", alt: "A smiling nurse with a stethoscope" },
    ],
  },
};

/* ── Services page (/services) ────────────────────────────────────────
   Mirrors the reference services page: hero (long threads) → one full-bleed
   section per service (one thread runs through all of them) → numbers →
   three stories (alternating sides) → FAQ → contact. */

export const SERVICES_PAGE = {
  hero: {
    lead: "Every Step",
    title: "of Your Care.",
    side: "Explore how Orovion helps you learn, share and get care — tailored to your goals, pace and needs.",
    eyebrow: "Services",
    intro: "Knowledge and care designed entirely around you — your questions, your pace and your needs. We help you move forward with verified answers, real conversations and lasting confidence.",
  },
  /** Three stories in a row; the page alternates the photo side (right, left, right). */
  stories: [
    {
      placeholder: true,
      eyebrow: "Real learners. Real progress.",
      title: "From textbook to bedside.",
      text: "Final-year student Priya used to freeze on complex scans. A month of Pulses and case discussions with verified radiologists later, she walked her own patient through the findings — calmly, and correctly.",
      cta: { label: "Start learning", to: "/login" },
      images: [
        { src: "/marketing/svc-story-main.jpg", alt: "A medical student in a mask holding up an X-ray" },
        { src: "/marketing/svc-story-detail.jpg", alt: "A doctor reviewing brain scans" },
      ],
    },
    {
      placeholder: true,
      eyebrow: "Real research. Real impact.",
      title: "From thesis to practice.",
      text: "Second-year resident Arjun had the data but no one to sharpen it with. Through Research & Thesis he found a verified mentor, tightened his methods over three rounds of review, and presented his study at his department’s grand rounds.",
      cta: { label: "Share your research", to: "/login" },
      images: [
        { src: "/marketing/svc-story-research-main.jpg", alt: "Two clinicians reviewing data on a monitor" },
        { src: "/marketing/svc-story-research-detail.jpg", alt: "A researcher in a mask examining a sample in a flask" },
      ],
    },
    {
      placeholder: true,
      eyebrow: "Real patients. Real answers.",
      title: "A second opinion, without the wait.",
      text: "When Meera’s father was advised spine surgery, the family wanted to be sure. A private consult with a verified orthopaedic surgeon — reports reviewed, every question answered on video — gave them a clear plan within two days.",
      cta: { label: "Book a consult", to: "/login" },
      images: [
        { src: "/marketing/svc-story-consult-main.jpg", alt: "A doctor in a white coat with a stethoscope" },
        { src: "/marketing/svc-story-consult-detail.jpg", alt: "Typing on a laptop beside a stethoscope" },
      ],
    },
  ],
};

/* ── FAQ ──────────────────────────────────────────────────────────────── */

const faqSection = (id: string) => FAQ_SECTIONS.find((s) => s.id === id)?.items ?? [];

/**
 * FAQ shown on the landing page — picked from the Help center source
 * (src/lib/faq.ts) so the answers never drift from /help.
 */
export const LANDING_FAQ: readonly FaqItem[] = [
  ...faqSection("getting-started").slice(0, 2),
  ...faqSection("verification").slice(0, 2),
  ...faqSection("consultations").slice(0, 1),
  ...faqSection("safety").slice(2, 3),
];

/** FAQ on /about — what people ask before trusting a new platform. */
export const ABOUT_FAQ: readonly FaqItem[] = [
  ...faqSection("getting-started").slice(0, 2),
  ...faqSection("verification").slice(0, 3),
  ...faqSection("safety").slice(0, 1),
];

/** FAQ on /services — how the services and consultations work. */
export const SERVICES_FAQ: readonly FaqItem[] = [
  ...faqSection("consultations").slice(0, 3),
  ...faqSection("posts-feed").slice(0, 2),
  ...faqSection("verification").slice(0, 1),
];

/** The journal page (/journal): hero copy above the article grid. */
export const JOURNAL_PAGE = {
  hero: {
    lead: "Insights",
    title: "That Matter.",
    side: "Cases, explainers and research to help you think clearly and care with confidence.",
    eyebrow: "Journal",
    intro: "Our journal is where verified clinicians share cases, practical explainers and research — one clear idea at a time, to help you learn, decide and care with confidence.",
  },
};

/** FAQ on journal articles — how posts and discussions work, and how they stay safe. */
export const JOURNAL_FAQ: readonly FaqItem[] = [
  ...faqSection("posts-feed").slice(0, 3),
  ...faqSection("safety").slice(0, 2),
  ...faqSection("verification").slice(0, 1),
];

/** FAQ on /contact — the questions people most often write in about. */
export const CONTACT_FAQ: readonly FaqItem[] = [
  ...faqSection("verification"),
  ...faqSection("consultations").slice(0, 2),
  ...faqSection("getting-started").slice(0, 1),
];
