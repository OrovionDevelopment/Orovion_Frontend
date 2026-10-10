/**
 * Help-centre Q&A content, as plain data.
 *
 * Extracted out of `src/screens/legal/HelpCenter.tsx` so the rendered accordion
 * and the FAQPage JSON-LD on /help read from ONE source. If they drift apart,
 * Google treats the markup as not matching visible page content — which loses
 * the rich result and can trigger a manual action.
 *
 * Framework-free on purpose (see CLAUDE.md): no React imports, so it stays
 * unit-testable from `src/lib/__tests__/`.
 */

export type FaqItem = readonly [question: string, answer: string];

export type FaqSection = {
  /** Anchor id — must match the section id used by LegalShell's jump nav. */
  id: string;
  title: string;
  items: readonly FaqItem[];
};

export const FAQ_SECTIONS: readonly FaqSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      ["What is Orovion?", "Orovion is a healthcare network where anyone can discover people, share knowledge, build meaningful connections and access healthcare professionals through consultations."],
      ["Who is Orovion for?", "Orovion is for everyone. Whether you are a doctor, healthcare professional, medical student, patient, caregiver, or simply someone interested in healthcare, you can be part of the network."],
      ["What can I do on Orovion?", "You can discover people and healthcare professionals, build connections, follow profiles, share Posts, Pulses, Case Studies and Research Summaries, explore healthcare knowledge, message your connections and request consultations."],
    ],
  },
  {
    id: "network",
    title: "Network & Connections",
    items: [
      ["How do I connect with someone?", "Find the person through Network or search, open their profile and select Connect. Once they accept your request, you become connected and can message each other."],
      ["Can I follow someone without connecting?", "Yes. You can follow someone to stay updated with their activity without sending a connection request."],
    ],
  },
  {
    id: "content-sharing",
    title: "Content & Sharing",
    items: [
      ["How do I share something on Orovion?", "You can create and share different types of professional content, including Posts, Pulses, Case Studies and Research Summaries."],
      ["What is the difference between Posts, Pulses, Case Studies and Research Summaries?", "They are different ways to share healthcare related content. Posts are for general professional thoughts and updates, Pulses are for shorter video insights or updates, Case Studies are for clinical case discussions, and Research Summaries are for sharing research and findings."],
    ],
  },
  {
    id: "consultations",
    title: "Consultations",
    items: [
      ["How do I request a consultation?", "Open the Consult tab, select a healthcare professional’s profile, tap Book Consultation, provide the requested details and submit your consultation request."],
      ["How does consultation scheduling work?", "After receiving your request, the healthcare professional reviews it and selects an available date and time. You will be notified once the consultation is scheduled."],
      ["What happens if my consultation request is rejected?", "Your payment is refunded. You can also request another consultation through the new request flow."],
      ["What happens if my scheduled consultation is missed?", "Your request automatically moves into a new consultation request flow. This can happen up to 3 times. If all 3 requests are rejected, the consultation is cancelled and your payment is refunded."],
      ["Can I message a healthcare professional after a consultation?", "Yes. Once a consultation is completed, a connection is established between both users, allowing you to continue communicating through messages."],
      ["What happens if a consultation is cancelled?", "If a consultation reaches the cancellation stage after the allowed consultation requests have been exhausted, the applicable payment is refunded."],
    ],
  },
  {
    id: "verification",
    title: "Verification",
    items: [
      ["How are healthcare professionals verified?", "Healthcare professionals submit their professional registration details, identity information and liveness verification. The submitted information is reviewed before verification is approved."],
      ["What does a verified profile mean?", "A verified profile means the healthcare professional has completed Orovion’s verification process and their submitted professional and identity information has been reviewed."],
    ],
  },
  {
    id: "safety",
    title: "Safety & Community",
    items: [
      ["Can I report a profile or content?", "Yes. You can report a profile or content using the available Report option and select the reason that best describes the issue."],
      ["What happens after I submit a report?", "Your report is reviewed against Orovion’s guidelines. Appropriate action may be taken based on the outcome of the review."],
      ["Can I block or mute someone?", "Yes. You can block or mute an account to manage how you interact with that person."],
    ],
  },
  {
    id: "profile-settings",
    title: "Profile & Settings",
    items: [
      ["How do I edit my profile?", "Open your profile and select the relevant edit option to update your information."],
      ["How do I manage my notifications?", "You can manage your notification preferences through the notification settings available in your account."],
      ["Can I change my account information?", "Yes. You can update the information that is available for editing through your profile and account settings."],
    ],
  },
  {
    id: "account-recovery",
    title: "Account & Recovery",
    items: [
      ["How do I contact Orovion support?", "You can contact the Orovion support team through the Help & Support section available in the app and web experience."],
      ["What happens when I delete my account?", "Your account enters a 30 day recovery period immediately after deletion. During this period, your profile and content are not visible to other users."],
      ["Can I recover my account after deleting it?", "Yes. You can recover your account within the 30 day recovery period by logging in with the same credentials you used before deletion."],
      ["What happens when I log in during the recovery period?", "Logging in with the same credentials restores your account and ends the recovery process, making your account available again."],
      ["What happens after the 30 day recovery period?", "After the 30 day recovery period ends, the account can no longer be recovered through the same recovery process."],
    ],
  },
];

/** Every Q&A pair, flattened — what the FAQPage JSON-LD is built from. */
export const ALL_FAQ_ITEMS: readonly FaqItem[] = FAQ_SECTIONS.flatMap((s) => s.items);
