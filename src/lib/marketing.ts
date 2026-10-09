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

/* ── Numbers ──────────────────────────────────────────────────────────── */

export const STATS = [
  { value: 12000, suffix: "+", label: "Verified clinicians", placeholder: true },
  { value: 40, suffix: "+", label: "Medical specialties", placeholder: true },
  { value: 180, suffix: "k", label: "Case discussions", placeholder: true },
  { value: 24, suffix: "/7", label: "Consults across time zones", placeholder: true },
];

/* ── Home page (/) ────────────────────────────────────────────────────
   Section order mirrors the reference home page: hero → trust toggle →
   services → philosophy → how it works → ready → text + big quote →
   community → get the app → FAQ → contact (numbers is switched off). Everything marked
   `placeholder: true` is illustrative copy to replace. */

export const STEPS = [
  { title: "Find a verified specialist", text: "Search by name, specialty or condition. Every clinician carries a license-verified badge before they can consult — no guesswork about who you are talking to." },
  { title: "Request a consultation", text: "Pick a slot from the doctor's live availability, share what is going on and attach your reports. Payment confirms the booking." },
  { title: "Meet on secure video", text: "Join the call inside Orovion. Prescriptions and summaries stay in your consultation history — only you and your doctor can open them." },
];

/**
 * The four services, shown as the home page's card wheel (`title`, `text`,
 * `image`); each card's "Read more" opens its story on /services (`#slug`).
 * Copy is product description — adjust to taste.
 */
export const SERVICES = [
  {
    slug: "Clinical-Cases",
    title: "Clinical Cases",
    text: "Explore real clinical cases shared by healthcare professionals, with insights into presentation, diagnosis, management and outcomes.",
    image: "/marketing/service-cases.jpg",
  },
  {
    slug: "Medical-Pulses",
    title: "Medical Pulses",
    text: "Discover concise healthcare insights, updates and perspectives shared by professionals across the network.",
    image: "/marketing/service-pulses.jpg",
  },
  {
    slug: "Research-Thesis",
    title: "Research Summary",
    text: "Discover concise summaries of research, findings and academic work shared by the healthcare community.",
    image: "/marketing/service-research.jpg",
  },
  {
    slug: "Private-Consults",
    title: "Private Consults",
    text: "Connect with verified healthcare professionals and request a private consultation based on your needs.",
    image: "/marketing/service-consults.jpg",
  },
];

export const HOME = {
  hero: {
    title: "Where Healthcare Comes Together.",
    text: "Orovion brings healthcare professionals, medical students and people to connect, share knowledge, explore real cases and access private consultations in one place.",
    cta: { label: "Join Orovion", to: "/login" },
    image: { src: "/marketing/hero-portrait.jpg", srcPhone: "/marketing/hero-portrait-tall.jpg" },
    placeholder: true,
  },
  /** The scroll-driven toggle that follows the hero. */
  trust: {
    label: "Verified",
    before: {
      title: "Healthcare is complex.\nFinding your way through it shouldn’t be.",
      lines: ["Orovion brings people, professionals, knowledge and care into one connected healthcare network."],
    },
    after: {
      title: "One network.",
      accent: "Four ways to connect with healthcare",
      text: "Discover clinical knowledge, connect with healthcare professionals, explore research and access private consultations.",
    },
  },
  /** Service cards — "Read more" opens the service's section on /services. */
  services: SERVICES.map((s) => ({ title: s.title, text: s.text, image: s.image, href: `/services#${s.slug}` })),
  philosophy: {
    eyebrow: "Our philosophy",
    text: "Healthcare works better when people, knowledge and care are connected. Orovion brings verified healthcare professionals, medical students and people into one network where knowledge can be shared, conversations can happen and care can be accessed with greater confidence.",
    cta: { label: "Meet the team", to: "/about" },
  },
  how: {
    title: { lead: "How", accent: "Orovion Works" },
    text: "A simple way to discover, connect and engage with healthcare. Orovion brings people, professionals, knowledge and consultations together in one connected experience.",
    steps: STEPS,
  },
  ready: {
    title: "Ready to join ",
    accent: "the network?",
    text: "Whether you’re a healthcare professional, a medical student or someone looking for trusted healthcare knowledge and guidance, Orovion gives you a place to connect, learn, share and access care.",
    cta: { label: "Join Orovion", to: "/login" },
  },
  statement: {
    title: "Know who you’re connecting with.",
    accent: "",
    text: "Orovion is designed to make professional identity and shared knowledge more transparent. Healthcare professionals can verify their credentials, while content remains connected to the people who share it. This gives the network a clearer foundation for meaningful conversations and informed connections.",
    link: { label: "", to: "" },
    tail: "",
  },
  quote: {
    placeholder: true,
    text: "Healthcare has always been about people. Orovion simply gives those connections a place to happen.",
    author: "OROVION",
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
    eyebrow: "BUILT FOR EVERYONE IN HEALTHCARE",
    title: "One network,\ndifferent ways to use it.",
    text: "Whether you’re a healthcare professional, medical student or general user, Orovion gives you a place to connect, learn, share and access healthcare.",
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
   way we help (scroll-lit text over a photo) → team cards → ready → big
   quote → FAQ. The team cards read from src/lib/team.ts. Everything marked
   `placeholder: true` is illustrative copy to replace. */

export const ABOUT = {
  hero: {
    lead: "Healthcare,",
    title: "connected.",
    side: "Find out who we are, what we stand for, and how we bring trusted care closer to everyone.",
    eyebrow: "About",
    intro: "Orovion is a healthcare platform built to bring professionals, students and people together around the knowledge, connections and care that shape better healthcare.",
  },
  help: {
    eyebrow: "THE WAY WE BUILD",
    image: { src: "/marketing/about-help.jpg", alt: "" },
    text: "We start with trust, verifying the professionals who join and giving every contribution a clear voice. From there, we build a space where healthcare knowledge can be shared, questions can be explored and meaningful connections can happen with greater confidence.",
  },
  team: {
    eyebrow: "Our team",
    title: "The People Building Orovion.",
    text: "Orovion is more than a platform, each member of our team brings a different perspective to building a more connected, trusted and useful healthcare experience.",
  },
  quote: {
    placeholder: true,
    text: "Healthcare works better when the right people, knowledge and conversations are connected.",
    author: "THE OROVION TEAM",
    image: { src: "/marketing/about-quote.jpg", alt: "Dark clouds lit by warm light" },
  },
};

/* ── Services page (/services) ────────────────────────────────────────
   After the reference services page: hero (long threads) → four stories, one
   per service (alternating sides; each is its home card's "Read more"
   target) → FAQ → contact. */

export const SERVICES_PAGE = {
  hero: {
    lead: "Healthcare,",
    title: "connected through knowledge and care.",
    side: "Explore how Orovion brings people, professionals, knowledge and care together through one connected healthcare network.",
    eyebrow: "",
    intro: "Orovion brings the healthcare experience together in one place, from learning and sharing knowledge to connecting with healthcare professionals and accessing consultations.",
  },
  /**
   * One story per service, in the home card order; the page alternates the
   * photo side (right, left, right, left). `slug` matches `SERVICES` — it is
   * the story's anchor, where that home card's "Read more" lands.
   */
  stories: [
    {
      placeholder: true,
      slug: "Clinical-Cases",
      eyebrow: "CASE STUDIES",
      title: "Understand healthcare through real cases.",
      text: "Case Studies allow healthcare professionals and medical students to share de identified clinical experiences in a structured format. Explore the clinical presentation, investigations, diagnosis, management and outcomes, and learn from how different cases are approached.",
      cta: { label: "", to: "" },
      images: [
        { src: "/marketing/svc-story-cases-main.jpg", alt: "A surgical team in masks looking down into the camera" },
        { src: "/marketing/svc-story-cases-detail.jpg", alt: "A doctor reviewing scans on a lightbox" },
      ],
    },
    {
      placeholder: true,
      slug: "Medical-Pulses",
      eyebrow: "MEDICAL PULSES",
      title: "Share and discover healthcare insights.",
      text: "Pulses are a way to share concise thoughts, knowledge, observations and professional perspectives with the Orovion community.Follow conversations across healthcare and discover insights from the people working and learning within it.",
      cta: { label: "", to: "" },
      images: [
        { src: "/marketing/svc-story-main.jpg", alt: "A medical student in a mask holding up an X-ray" },
        { src: "/marketing/svc-story-detail.jpg", alt: "A doctor reviewing brain scans" },
      ],
    },
    {
      placeholder: true,
      slug: "Research-Thesis",
      eyebrow: "RESEARCH SUMMARY",
      title: "Make healthcare research easier to understand.",
      text: "Explore concise summaries of research, findings and academic work shared on Orovion. Understand the key ideas, findings and relevance without having to navigate through lengthy research papers.",
      cta: { label: "", to: "" },
      images: [
        { src: "/marketing/svc-story-research-main.jpg", alt: "Two clinicians reviewing data on a monitor" },
        { src: "/marketing/svc-story-research-detail.jpg", alt: "A researcher in a mask examining a sample in a flask" },
      ],
    },
    {
      placeholder: true,
      slug: "Private-Consults",
      eyebrow: "PRIVATE CONSULTS",
      title: "Connect with a verified healthcare professional.",
      text: "Private Consults give people a direct way to request time with healthcare professionals on Orovion. Find the right professional, send a consultation request, receive a suitable time and connect privately when the consultation begins.",
      cta: { label: "", to: "" },
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
