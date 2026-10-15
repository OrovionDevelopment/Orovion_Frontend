// Why an account may not sign in, as the API reports it on a 403 (`data.code`):
// a suspension, an archived account, or a recovery period that has ended.
//
// The API signs a suspended user out everywhere, so the next request fails and
// the client logs them out. Without this, they land on the login screen with no
// idea why. The reason is saved just before the logout (sessionStorage, this tab
// only) and the login screen shows it. A login attempt that is refused carries
// the same `data`, so the message is identical either way.
//
// Framework-free so it is unit-testable (repo rule: logic lives in src/lib).

export type AccountBlock =
  | { code: "ACCOUNT_SUSPENDED"; suspendedUntil: string | null; permanent: boolean; reason: string | null }
  | { code: "ACCOUNT_ARCHIVED" }
  | { code: "RECOVERY_EXPIRED"; scheduledDeletionAt?: string | null };

const KEY = "dl:account-block";
const CODES = ["ACCOUNT_SUSPENDED", "ACCOUNT_ARCHIVED", "RECOVERY_EXPIRED"];

const isBlock = (d: unknown): d is AccountBlock =>
  !!d && typeof d === "object" && CODES.includes((d as { code?: string }).code || "");

/** The block an API error carries, if any. */
export function blockFromError(e: any): AccountBlock | null {
  const d = e?.response?.data?.data;
  return isBlock(d) ? d : null;
}

const store = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

/** Remember why the person is about to be signed out. */
export function stashBlock(b: AccountBlock | null): void {
  if (!b) return;
  try { store()?.setItem(KEY, JSON.stringify(b)); } catch { /* private mode — the login form still explains on retry */ }
}

/** Read (once) the reason saved before the last forced sign-out. */
export function takeBlock(): AccountBlock | null {
  try {
    const s = store();
    const raw = s?.getItem(KEY);
    if (!raw) return null;
    s?.removeItem(KEY);
    const b = JSON.parse(raw);
    return isBlock(b) ? b : null;
  } catch {
    return null;
  }
}

/** A short title and an explanation for people. */
export function describeBlock(b: AccountBlock, locale?: string): { title: string; body: string } {
  if (b.code === "ACCOUNT_SUSPENDED") {
    const until = b.suspendedUntil ? new Date(b.suspendedUntil) : null;
    const valid = until && !Number.isNaN(until.getTime());
    const when = valid ? until!.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) : null;
    const timing = b.permanent || !when ? "This suspension has no end date." : `You can sign in again from ${when}.`;
    const reason = b.reason ? ` Reason: ${b.reason}.` : "";
    return {
      title: "Your account is suspended",
      body: `${timing}${reason} If you think this is a mistake, contact support.`,
    };
  }
  if (b.code === "ACCOUNT_ARCHIVED") {
    return {
      title: "This account has been archived",
      body: "Its recovery period ended, so it can no longer be restored. You can create a new account, or contact support.",
    };
  }
  return {
    title: "The recovery period has ended",
    body: "This account can no longer be restored. You can create a new account with the same phone number or email.",
  };
}

/** The one-line form used inline on the login screen. */
export function blockMessage(b: AccountBlock, locale?: string): string {
  const { title, body } = describeBlock(b, locale);
  return `${title}. ${body}`;
}
